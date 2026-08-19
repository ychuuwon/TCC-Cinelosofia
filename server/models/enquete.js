const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  sinopse: { type: String, default: '' },
  genero: { type: String, default: '', trim: true },
  capa: { type: String, default: '' },
});

const voteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  optionIndex: { type: Number },
  data: { type: Date, default: Date.now },
});

const enqueteSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  options: { type: [optionSchema], default: [] },
  isOpen: { type: Boolean, default: false },
  destaque: { type: Boolean, default: false },
  votes: { type: [voteSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Enquete', enqueteSchema);
