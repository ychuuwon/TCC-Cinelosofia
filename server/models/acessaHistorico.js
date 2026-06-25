const mongoose = require('mongoose');

const acessaHistoricoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  tipo_recurso: {
    type: String,
    required: true,
    enum: ['chat', 'encontro', 'acervo'],
  },
  recurso_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  data_hora: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: false });

module.exports = mongoose.model('AcessaHistorico', acessaHistoricoSchema);