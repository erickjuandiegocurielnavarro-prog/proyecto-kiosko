const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, default: '@cliente' },
  itemsSummary: { type: String, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pendiente', 'En Preparación', 'Completado', 'Cancelado'], 
    default: 'Pendiente' 
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'pedidos', strict: false });

module.exports = mongoose.model('Order', orderSchema);
