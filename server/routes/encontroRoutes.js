const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/', authMiddleware, criarEncontro);
router.put('/:id', authMiddleware, atualizarEncontro);
router.delete('/:id', authMiddleware, deletarEncontro);
router.post('/:id/presenca', authMiddleware, registrarPresenca);
router.get('/:id/presencas', authMiddleware, listarPresencas);

module.exports = router;
