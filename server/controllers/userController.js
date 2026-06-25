const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

const loginUser = async (req, res) => {
  try {
    const { login, senha } = req.body;

    const usuario = await User.findOne({ login });
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
        login: usuario.login,
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
    const { login, senha, adm } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ erro: 'Login e senha são obrigatórios.' });
    }

    const usuarioExiste = await User.findOne({ login });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Este usuário já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = await User.create({
      id: Date.now(),
      login,
      senha: senhaHash,
      adm: Boolean(adm),
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        login: novoUsuario.login,
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