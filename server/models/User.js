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
    match: [/^\d+$/, 'A matrícula deve conter apenas números.'],
    minlength: [10, 'A matrícula deve conter exatamente 10 algarismos.'],
    maxlength: [10, 'A matrícula deve conter exatamente 10 algarismos.'],
  },
  nome_usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Digite um email válido.'],
  },
  senha: {
    type: String,
    required: true,
  },
  adm: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);