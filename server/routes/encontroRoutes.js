const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  buscarProximo,
  buscarAtivo,
  buscarPorId,
  criarEncontro,
  atualizarEncontro,
  salvarAtivo,
  deletarEncontro,
  registrarPresenca,
  listarPresencas,
} = require('../controllers/encontroController');

const upload = multer({ storage: multer.memoryStorage() });

// Rotas públicas
router.get('/', buscarTodos);
router.get('/proximo', buscarProximo);
router.get('/ativo', buscarAtivo);
router.get('/:id', buscarPorId);

// Rotas autenticadas
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), criarEncontro);
router.put('/ativo', authMiddleware, adminMiddleware, upload.single('image'), salvarAtivo);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), atualizarEncontro);
router.delete('/:id', authMiddleware, adminMiddleware, deletarEncontro);
router.post('/:id/presenca', authMiddleware, registrarPresenca);
router.get('/:id/presencas', authMiddleware, listarPresencas);

module.exports = router;
