const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema({
  autor: { type: String, trim: true },
  mensagem: { type: String, required: true, trim: true },
  motivo: { type: String, trim: true },
  status: { type: String, enum: ['Pendente', 'Revisada'], default: 'Pendente' },
  acaoMensagem: { type: String, enum: ['Pendente', 'Mantida', 'Removida'], default: 'Pendente' },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  comentarioId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

module.exports = mongoose.model('Denuncia', denunciaSchema);
