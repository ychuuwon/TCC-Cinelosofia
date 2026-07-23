const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  buscarTodos,
  buscarPorId,
  criarChat,
  adicionarComentario,
  deletarComentario,
} = require('../controllers/chatController');

// Rotas públicas
router.get('/', buscarTodos);
router.get('/:id', buscarPorId);

// Rotas autenticadas
router.post('/', authMiddleware, criarChat);
router.post('/:id/comentarios', authMiddleware, adicionarComentario);
router.delete('/:chatId/comentarios/:comentarioId', authMiddleware, deletarComentario);

module.exports = router;
