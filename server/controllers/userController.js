const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

const loginUser = async (req, res) => {
  try {
    const { matricula, nome_usuario, senha } = req.body;

    if ((!matricula && !nome_usuario) || !senha) {
      return res.status(400).json({ erro: 'Nome de usuário ou matrícula e senha são obrigatórios.' });
    }

    const usuario = await User.findOne(
      matricula ? { matricula } : { nome_usuario }
    );
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
    const { matricula, nome_usuario, senha } = req.body;

    if (!matricula || !nome_usuario || !senha) {
      return res.status(400).json({ erro: 'Matrícula, nome de usuário e senha são obrigatórios.' });
    }

    const usuarioExisteMatricula = await User.findOne({ matricula });
    if (usuarioExisteMatricula) {
      return res.status(400).json({ erro: 'Esta matrícula já está cadastrada.' });
    }

    const usuarioExisteUsername = await User.findOne({ nome_usuario });
    if (usuarioExisteUsername) {
      return res.status(400).json({ erro: 'Este nome de usuário já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = await User.create({
      id: Date.now(),
      matricula,
      nome_usuario,
      senha: senhaHash,
      adm: false,
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        matricula: novoUsuario.matricula,
        nome_usuario: novoUsuario.nome_usuario,
        adm: novoUsuario.adm,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao realizar cadastro.' });
  }
};

module.exports = {
  loginUser,
  registerUser,
};