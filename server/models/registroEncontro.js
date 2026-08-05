const mongoose = require('mongoose');

const encontroSnapshotSchema = new mongoose.Schema({
  tema: { type: String, required: true },
  sinopse: { type: String },
  direcao: { type: String },
  ano: { type: Number },
  genero: { type: String },
  foto_capa: { type: String },
  data: { type: Date },
  hora: { type: String },
  local: { type: String },
  duracao: { type: String },
  obs: { type: String },
  trailer: { type: String },
}, { _id: false });

const registroEncontroSchema = new mongoose.Schema({
  encontro_original: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encontro',
    required: true,
  },
  encontro_snapshot: {
    type: encontroSnapshotSchema,
    required: true,
  },
  questoes_discussao: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('RegistroEncontro', registroEncontroSchema);