const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const {
  JWT_SECRET,
  EMAIL_USER,
  BREVO_API_KEY,
} = require('../config');

const sendEmail = async (mailOptions) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: EMAIL_USER, name: 'Cinelosofia' },
      to: [{ email: mailOptions.to }],
      subject: mailOptions.subject,
      htmlContent: mailOptions.html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Brevo API ${response.status}: ${details}`);
    error.code = 'BREVO_API_ERROR';
    throw error;
  }

  return response.json();
};

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
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login efetuado com sucesso!',
      usuario: {
        id: usuario._id,
        matricula: usuario.matricula,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil,
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
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({
        erro: 'Este email não está cadastrado no Cinelosofia.',
      });
    }

    if (!BREVO_API_KEY || !EMAIL_USER) {
      console.error('Recuperação de senha indisponível: BREVO_API_KEY/EMAIL_USER não configurados.');
      return res.status(503).json({
        erro: 'O serviço de email está temporariamente indisponível. Tente novamente mais tarde.',
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutos

    usuario.resetPasswordToken = resetTokenHash;
    usuario.resetPasswordExpires = resetTokenExpires;
    await usuario.save();

    // Prefer the configured public frontend URL, then the browser origin.
    const configuredClientUrl = process.env.CLIENT_URL?.trim();
    const requestOrigin = req.get('origin')?.trim();
    const isLocalClientUrl = configuredClientUrl
      && /:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configuredClientUrl);
    const isPublicRequestOrigin = requestOrigin
      && !/:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(requestOrigin);
    const clientUrl = isPublicRequestOrigin
      ? requestOrigin
      : (configuredClientUrl && !isLocalClientUrl
        ? configuredClientUrl
        : (requestOrigin || `${req.protocol}://${req.get('host')}`));
    const resetLink = `${clientUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

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

    try {
      await sendEmail(mailOptions);
    } catch (emailError) {
      usuario.resetPasswordToken = null;
      usuario.resetPasswordExpires = null;
      await usuario.save();
      console.error('Erro ao enviar email de recuperação:', {
        code: emailError.code,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });
      return res.status(503).json({
        erro: 'Não foi possível enviar o email de recuperação. Tente novamente mais tarde.',
        codigo: emailError.code || 'SMTP_SEND_FAILED',
      });
    }

    return res.status(200).json({
      mensagem: 'Link de recuperação enviado para o email cadastrado.',
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

    try {
      await sendEmail(mailOptions);
    } catch (emailError) {
      // A senha já foi alterada; a falha da confirmação não deve desfazer o reset.
      console.error('Senha alterada, mas não foi possível enviar confirmação:', {
        code: emailError.code,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });
    }

    return res.status(200).json({
      mensagem: 'Senha alterada com sucesso! Você já pode fazer login com sua nova senha.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao redefinir senha.' });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { nome_usuario: nomeUsuario, email, senha } = req.body;
    const usuario = await User.findById(req.userId);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    if (nomeUsuario !== undefined) {
      const nomeNormalizado = nomeUsuario.trim();
      if (!nomeNormalizado) {
        return res.status(400).json({ erro: 'O nome de usuário não pode ficar vazio.' });
      }
      const nomeEmUso = await User.findOne({ nome_usuario: nomeNormalizado, _id: { $ne: usuario._id } });
      if (nomeEmUso) {
        return res.status(400).json({ erro: 'Este nome de usuário já está em uso.' });
      }
      usuario.nome_usuario = nomeNormalizado;
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) {
        return res.status(400).json({ erro: 'Digite um email válido.' });
      }
      const emailEmUso = await User.findOne({ email: emailNormalizado, _id: { $ne: usuario._id } });
      if (emailEmUso) {
        return res.status(400).json({ erro: 'Este email já está em uso.' });
      }
      usuario.email = emailNormalizado;
    }

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      usuario.senha = await bcrypt.hash(senha, await bcrypt.genSalt(10));
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, `perfil-${usuario._id}`);
      usuario.fotoPerfil = result.secure_url;
    }

    await usuario.save();
    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: {
        id: usuario._id,
        matricula: usuario.matricula,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil,
        adm: usuario.adm,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message || 'Erro ao atualizar perfil.' });
  }
};

const listarUsuariosAdmin = async (req, res) => {
  try {
    const usuarios = await User.find({ adm: { $ne: true } })
      .select('_id nome_usuario email matricula adm chatBanido fotoPerfil')
      .sort({ nome_usuario: 1 })
      .lean();

    const usuariosComuns = usuarios.filter((usuario) => (
      usuario.adm !== true
      && usuario.adm !== 'true'
      && usuario.adm !== 1
      && usuario.adm !== '1'
    ));

    return res.status(200).json(usuariosComuns);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
};

const alternarBanimentoChat = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    usuario.chatBanido = !usuario.chatBanido;
    usuario.chatBanidoEm = usuario.chatBanido ? new Date() : null;
    await usuario.save();

    return res.status(200).json({
      mensagem: usuario.chatBanido ? 'Usuário banido do chat.' : 'Usuário autorizado a usar o chat.',
      usuario: {
        _id: usuario._id,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
        matricula: usuario.matricula,
        adm: usuario.adm,
        chatBanido: usuario.chatBanido,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar acesso ao chat.' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  atualizarPerfil,
  listarUsuariosAdmin,
  alternarBanimentoChat,
};