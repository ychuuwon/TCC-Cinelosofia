const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

const upload = multer({ storage: multer.memoryStorage() });

// Rotas dos agendamentos. O próprio nome do controller que ela usa diz sua função
// mais caso vocês se confundam, sugiro comentar as rotas igual os controllers.

router.post('/', authMiddleware, upload.single('image'), createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/:id', authMiddleware, getAppointmentById);
router.put('/:id', authMiddleware, upload.single('image'), updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;
