const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  texto: {
    type: String,
    required: true,
    maxlength: 500,
  },
  enviadoEm: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  tema: {
    type: String,
    required: true,
    maxlength: 100,
  },
  comentarios: [comentarioSchema],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);