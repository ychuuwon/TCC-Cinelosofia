const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  slot: {
    type: String,
    enum: ['home', 'login', 'register'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('CarouselImage', carouselImageSchema);
