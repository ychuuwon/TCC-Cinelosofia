const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  buscarProximo,
  buscarPorId,
  criarEncontro,
  atualizarEncontro,
  deletarEncontro,
  registrarPresenca,
  listarPresencas,
} = require('../controllers/encontroController');

// Rotas públicas
router.get('/', buscarTodos);
router.get('/proximo', buscarProximo);
router.get('/:id', buscarPorId);

// Rotas autenticadas
router.post('/', authMiddleware, adminMiddleware, criarEncontro);
router.put('/:id', authMiddleware, adminMiddleware, atualizarEncontro);
router.delete('/:id', authMiddleware, adminMiddleware, deletarEncontro);
router.post('/:id/presenca', authMiddleware, registrarPresenca);
router.get('/:id/presencas', authMiddleware, listarPresencas);

module.exports = router;
