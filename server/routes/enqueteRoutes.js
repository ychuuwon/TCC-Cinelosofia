const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  buscarAtivo,
  buscarPorId,
  criarEnquete,
  abrirFechar,
  votar,
  removerVoto,
  deletar,
} = require('../controllers/enqueteController');

router.get('/', buscarTodos);
router.get('/ativo', buscarAtivo);
router.get('/:id', buscarPorId);
router.post('/', authMiddleware, adminMiddleware, criarEnquete);
router.put('/:id/open', authMiddleware, adminMiddleware, abrirFechar);
router.post('/:id/voto', authMiddleware, votar);
router.delete('/:id/voto', authMiddleware, removerVoto);
router.delete('/:id', authMiddleware, adminMiddleware, deletar);

module.exports = router;
