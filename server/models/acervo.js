const mongoose = require('mongoose');

const acervoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['cine', 'curta'],
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  sinopse: {
    type: String,
    required: true,
  },
  direcao: {
    type: String,
    required: true,
  },
  ano: {
    type: Number,
    required: true,
  },
  duracao: {
    type: String,
    required: true,
  },
  genero: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero',
    required: true,
  },
  class_etaria: {
    type: String,
    maxlength: 2,
  },
  foto_capa: {
    type: String,
  },
  tema: {
    type: String,
  },
  autores: {
    type: String,
  },
  elenco: {
    type: String,
  },
  link_video: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Acervo', acervoSchema);