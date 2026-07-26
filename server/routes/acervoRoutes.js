const express = require('express');
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

// Rotas públicas
router.get('/', buscarTodos);
router.get('/:id', buscarPorId);

// Rotas autenticadas (admin)
router.post('/', authMiddleware, adminMiddleware, criarAcervo);
router.put('/:id', authMiddleware, adminMiddleware, atualizarAcervo);
router.delete('/:id', authMiddleware, adminMiddleware, deletarAcervo);

module.exports = router;
