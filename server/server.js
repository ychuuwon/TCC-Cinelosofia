// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const encontroRoutes = require('./routes/encontroRoutes');
const acervoRoutes = require('./routes/acervoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const generoRoutes = require('./routes/generoRoutes');
const { PORT } = require('./config');

connectDB();

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

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
