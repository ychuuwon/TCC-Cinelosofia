const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { listar, criar, deletar } = require('../controllers/carouselController');

router.get('/', listar);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), criar);
router.delete('/:id', authMiddleware, adminMiddleware, deletar);

module.exports = router;
