const mongoose = require('mongoose');

const presencaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  data_registro: {
    type: Date,
    default: Date.now,
  },
});

const encontroSchema = new mongoose.Schema({
  tema: {
    type: String,
    required: true,
    maxlength: 100,
  },
  data: {
    type: Date,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  local: {
    type: String,
    required: true,
    maxlength: 100,
  },
  duracao: {
    type: String,
  },
  obs: {
    type: String,
    maxlength: 100,
  },
  presencas: [presencaSchema],
}, { timestamps: true });

module.exports = mongoose.model('Encontro', encontroSchema);