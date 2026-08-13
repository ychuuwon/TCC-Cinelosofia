const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');
const { EMAIL_USER, EMAIL_PASS } = process.env;

// Configurar transporte do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const loginUser = async (req, res) => {
  try {
    const { matricula, nome_usuario, senha } = req.body;

    if ((!matricula && !nome_usuario) || !senha) {
      return res.status(400).json({ erro: 'Nome de usuário ou matrícula e senha são obrigatórios.' });
    }

    const query = [];
    if (matricula) query.push({ matricula });
    if (nome_usuario) query.push({ nome_usuario });

    const usuario = await User.findOne({ $or: query });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { userId: usuario._id, adm: usuario.adm },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      mensagem: 'Login efetuado com sucesso!',
      usuario: {
        id: usuario._id,
        matricula: usuario.matricula,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
        adm: usuario.adm,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { matricula, nome_usuario, email, senha } = req.body;

    if (!matricula || !nome_usuario || !email || !senha) {
      return res.status(400).json({ erro: 'Matrícula, nome de usuário, email e senha são obrigatórios.' });
    }

    if (!/^\d+$/.test(matricula)) {
      return res.status(400).json({ erro: 'A matrícula deve conter apenas números.' });
    }

    if (matricula.length !== 10) {
      return res.status(400).json({ erro: 'A matrícula deve conter exatamente 10 algarismos.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ erro: 'Digite um email válido.' });
    }

    const usuarioExisteMatricula = await User.findOne({ matricula });
    if (usuarioExisteMatricula) {
      return res.status(400).json({ erro: 'Esta matrícula já está cadastrada.' });
    }

    const usuarioExisteUsername = await User.findOne({ nome_usuario });
    if (usuarioExisteUsername) {
      return res.status(400).json({ erro: 'Este nome de usuário já está em uso.' });
    }

    const usuarioExisteEmail = await User.findOne({ email });
    if (usuarioExisteEmail) {
      return res.status(400).json({ erro: 'Este email já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = await User.create({
      id: Date.now(),
      matricula,
      nome_usuario,
      email,
      senha: senhaHash,
      adm: false,
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        matricula: novoUsuario.matricula,
        nome_usuario: novoUsuario.nome_usuario,
        email: novoUsuario.email,
        adm: novoUsuario.adm,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao realizar cadastro.' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      // Por segurança, não informamos se o email existe ou não
      return res.status(200).json({
        mensagem: 'Se o email existir em nosso banco de dados, você receberá um link de recuperação.',
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutos

    usuario.resetPasswordToken = resetTokenHash;
    usuario.resetPasswordExpires = resetTokenExpires;
    await usuario.save();

    // Criar link de reset
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Enviar email
    const mailOptions = {
      from: EMAIL_USER,
      to: usuario.email,
      subject: 'Recuperação de Senha - Cinelosofia',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de sua senha no Portal Cinelosofia.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="color: #007bff; text-decoration: none;">
          ${resetLink}
        </a>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou essa recuperação, ignore este email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      mensagem: 'Se o email existir em nosso banco de dados, você receberá um link de recuperação.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao solicitar recuperação de senha.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha, confirmarSenha } = req.body;

    if (!token || !novaSenha || !confirmarSenha) {
      return res.status(400).json({ erro: 'Token, nova senha e confirmação são obrigatórios.' });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({ erro: 'As senhas não coincidem.' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    // Hash do token para comparar no banco
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ erro: 'Token de reset expirado ou inválido.' });
    }

    // Atualizar senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    usuario.senha = senhaHash;
    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpires = null;
    await usuario.save();

    // Enviar email de confirmação
    const mailOptions = {
      from: EMAIL_USER,
      to: usuario.email,
      subject: 'Senha Alterada com Sucesso - Cinelosofia',
      html: `
        <h2>Senha Alterada</h2>
        <p>Sua senha foi alterada com sucesso no Portal Cinelosofia.</p>
        <p>Se você não realizou essa alteração, entre em contato conosco imediatamente.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      mensagem: 'Senha alterada com sucesso! Você já pode fazer login com sua nova senha.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao redefinir senha.' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
};