// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const encontroRoutes = require('./routes/encontroRoutes');
const acervoRoutes = require('./routes/acervoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const generoRoutes = require('./routes/generoRoutes');
const User = require('./models/User');
const { PORT } = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/imagens', express.static(path.join(__dirname, '..', 'imagens')));

app.use('/api/users', userRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/encontros', encontroRoutes);
app.use('/api/acervos', acervoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/generos', generoRoutes);

const ensureAdminUser = async () => {
  try {
    const adminExistente = await User.findOne({ adm: true });
    if (adminExistente) {
      console.log('Usuário administrador já existe');
      return;
    }

    const matricula = process.env.ADMIN_MATRICULA || 'admin';
    const nomeUsuario = process.env.ADMIN_NOME_USUARIO || 'admin';
    const senha = process.env.ADMIN_SENHA || 'admin123';

    const usuarioExistente = await User.findOne({
      $or: [{ matricula }, { nome_usuario: nomeUsuario }],
    });

    if (usuarioExistente) {
      usuarioExistente.adm = true;
      await usuarioExistente.save();
      console.log(`Usuário existente promovido a administrador: ${nomeUsuario}`);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    await User.create({
      id: Date.now(),
      matricula,
      nome_usuario: nomeUsuario,
      senha: senhaHash,
      adm: true,
    });

    console.log(`Usuário administrador criado com sucesso: ${nomeUsuario}`);
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error.message);
    process.exit(1);
  }
};

startServer();
