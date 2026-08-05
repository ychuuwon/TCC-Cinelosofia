const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  buscarTodos,
  criarRegistro,
  deletarRegistro,
} = require('../controllers/registroEncontroController');

router.get('/', buscarTodos);
router.post('/', authMiddleware, adminMiddleware, criarRegistro);
router.delete('/:id', authMiddleware, adminMiddleware, deletarRegistro);

module.exports = router;