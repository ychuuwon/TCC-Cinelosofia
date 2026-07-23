const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/', authMiddleware, criarAcervo);
router.put('/:id', authMiddleware, atualizarAcervo);
router.delete('/:id', authMiddleware, deletarAcervo);

module.exports = router;
