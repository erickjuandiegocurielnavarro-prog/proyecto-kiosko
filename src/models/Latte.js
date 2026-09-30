const mongoose = require('mongoose');

const latteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  precio: { type: Number, required: true },
  user: { type: String, default: '@anonimo' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'lattes', strict: false });

module.exports = mongoose.model('Latte', latteSchema);
