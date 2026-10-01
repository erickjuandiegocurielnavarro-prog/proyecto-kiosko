const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['cafe', 'frappe', 'combos', 'pan'] },
  categoryLabel: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'images/cafe.jpg' },
  description: { type: String, default: '' },
  badgeClass: { type: String, default: 'chip-cafe' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'productos', strict: false });

module.exports = mongoose.model('Product', productSchema);
