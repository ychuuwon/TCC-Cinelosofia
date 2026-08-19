const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { listarDenuncias, listarMinhasDenuncias, criarDenuncia, deletarDenuncia, atualizarStatus, atualizarAcaoMensagem } = require('../controllers/denunciaController');

// Usuários autenticados podem criar e consultar suas denúncias
router.post('/', authMiddleware, criarDenuncia);
router.get('/minhas', authMiddleware, listarMinhasDenuncias);

// Admin: listar, deletar, atualizar
router.get('/', authMiddleware, adminMiddleware, listarDenuncias);
router.delete('/:id', authMiddleware, adminMiddleware, deletarDenuncia);
router.put('/:id/status', authMiddleware, adminMiddleware, atualizarStatus);
router.put('/:id/mensagem', authMiddleware, adminMiddleware, atualizarAcaoMensagem);

module.exports = router;
