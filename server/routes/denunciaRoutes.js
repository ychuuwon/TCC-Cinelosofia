const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { listarDenuncias, criarDenuncia, deletarDenuncia, atualizarStatus, atualizarAcaoMensagem } = require('../controllers/denunciaController');

// Public: criar denúncia
router.post('/', criarDenuncia);

// Admin: listar, deletar, atualizar
router.get('/', authMiddleware, adminMiddleware, listarDenuncias);
router.delete('/:id', authMiddleware, adminMiddleware, deletarDenuncia);
router.put('/:id/status', authMiddleware, adminMiddleware, atualizarStatus);
router.put('/:id/mensagem', authMiddleware, adminMiddleware, atualizarAcaoMensagem);

module.exports = router;
