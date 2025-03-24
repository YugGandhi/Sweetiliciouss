const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity250g: { type: Number, default: 0 },
  quantity500g: { type: Number, default: 0 },
  quantity1kg: { type: Number, default: 0 },
  quantitySold: { type: Number, default: 0 },
  price: { type: Number, required: true },
  description: { type: String },
  photos: [{ data: Buffer, contentType: String }] // Storing images in binary format
});

const Sweet = mongoose.model('Sweet', sweetSchema);
module.exports = Sweet;
