const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
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
router.post('/', authMiddleware, adminMiddleware, criarGenero);
router.put('/:id', authMiddleware, adminMiddleware, atualizarGenero);
router.delete('/:id', authMiddleware, adminMiddleware, deletarGenero);

module.exports = router;
