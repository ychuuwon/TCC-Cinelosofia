const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { loginUser, registerUser, requestPasswordReset, resetPassword, atualizarPerfil, listarUsuariosAdmin, alternarBanimentoChat } = require('../controllers/userController');

const logProfileUploadRequest = (req, res, next) => {
	console.info('[profile-upload] request received', {
		contentType: req.get('content-type') || 'missing',
	});
	next();
};

const logParsedProfileUpload = (req, res, next) => {
	console.info('[profile-upload] multipart parsed', {
		fileReceived: Boolean(req.file),
		size: req.file?.size || 0,
		mimetype: req.file?.mimetype || 'missing',
	});
	next();
};

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.put('/profile', logProfileUploadRequest, authMiddleware, upload.single('fotoPerfil'), logParsedProfileUpload, atualizarPerfil);
router.get('/admin', authMiddleware, adminMiddleware, listarUsuariosAdmin);
router.put('/admin/:id/chat-ban', authMiddleware, adminMiddleware, alternarBanimentoChat);

module.exports = router;
