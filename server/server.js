// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const connectDB = require('./mongo');
const { PORT } = require('./config');
const { uploadToCloudinary } = require('./utils/cloudinary');
const userRoutes = require('./routes/userRoutes');
const encontroRoutes = require('./routes/encontroRoutes');
const acervoRoutes = require('./routes/acervoRoutes');
const registroEncontroRoutes = require('./routes/registroEncontroRoutes');
const chatRoutes = require('./routes/chatRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const denunciaRoutes = require('./routes/denunciaRoutes');
const User = require('./models/User');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/imagens', express.static(path.join(__dirname, '..', 'imagens')));

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo de imagem é obrigatório.' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      mensagem: 'Imagem enviada com sucesso.',
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message || 'Erro ao enviar imagem para o Cloudinary.' });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/encontros', encontroRoutes);
app.use('/api/acervos', acervoRoutes);
app.use('/api/registros-encontros', registroEncontroRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/denuncias', denunciaRoutes);

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
