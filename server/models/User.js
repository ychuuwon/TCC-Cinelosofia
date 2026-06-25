const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20,
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