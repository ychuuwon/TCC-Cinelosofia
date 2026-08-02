const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  buscarPorId,
  criarAcervo,
  atualizarAcervo,
  deletarAcervo,
} = require('../controllers/acervoController');

const upload = multer({ storage: multer.memoryStorage() });

// Rotas públicas
router.get('/', buscarTodos);
router.get('/:id', buscarPorId);

// Rotas autenticadas (admin)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), criarAcervo);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), atualizarAcervo);
router.delete('/:id', authMiddleware, adminMiddleware, deletarAcervo);

module.exports = router;
