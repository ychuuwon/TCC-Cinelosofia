const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  buscarPorId,
  criarChat,
  adicionarComentario,
  deletarComentario,
  buscarComentariosSinalizados,
  aprovarComentario,
  rejeitar,
} = require('../controllers/chatController');

// Rotas autenticadas
router.post('/', authMiddleware, criarChat);
router.post('/:id/comentarios', authMiddleware, adicionarComentario);
router.delete('/:chatId/comentarios/:comentarioId', authMiddleware, deletarComentario);

// Rotas públicas
router.get('/', buscarTodos);
router.get('/:id', buscarPorId);

// Rotas de moderação (apenas admin)
router.get('/admin/sinalizados', authMiddleware, adminMiddleware, buscarComentariosSinalizados);
router.patch('/admin/:chatId/comentarios/:comentarioId/aprovar', authMiddleware, adminMiddleware, aprovarComentario);
router.delete('/admin/:chatId/comentarios/:comentarioId/rejeitar', authMiddleware, adminMiddleware, rejeitar);

module.exports = router;
