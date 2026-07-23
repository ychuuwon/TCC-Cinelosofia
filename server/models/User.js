const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  matricula: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  nome_usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
  },
  senha: {
    type: String,
    required: true,
  },
  adm: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);