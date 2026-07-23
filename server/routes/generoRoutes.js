const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  buscarTodos,
  buscarPorId,
  criarGenero,
  atualizarGenero,
  deletarGenero,
} = require('../controllers/generoController');

// Rotas públicas
router.get('/', buscarTodos);
router.get('/:id', buscarPorId);

// Rotas autenticadas (admin)
router.post('/', authMiddleware, criarGenero);
router.put('/:id', authMiddleware, atualizarGenero);
router.delete('/:id', authMiddleware, deletarGenero);

module.exports = router;
