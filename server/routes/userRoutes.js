const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { loginUser, registerUser, requestPasswordReset, resetPassword, listarUsuariosAdmin, alternarBanimentoChat } = require('../controllers/userController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/admin', authMiddleware, adminMiddleware, listarUsuariosAdmin);
router.put('/admin/:id/chat-ban', authMiddleware, adminMiddleware, alternarBanimentoChat);

module.exports = router;
