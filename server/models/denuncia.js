const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema({
  autor: { type: String, trim: true },
  mensagem: { type: String, required: true, trim: true },
  motivo: { type: String, trim: true },
  status: { type: String, enum: ['Pendente', 'Revisada'], default: 'Pendente' },
}, { timestamps: true });

module.exports = mongoose.model('Denuncia', denunciaSchema);
