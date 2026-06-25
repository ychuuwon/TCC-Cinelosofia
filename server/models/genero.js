const mongoose = require('mongoose');

const generoSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: false });

module.exports = mongoose.model('Genero', generoSchema);