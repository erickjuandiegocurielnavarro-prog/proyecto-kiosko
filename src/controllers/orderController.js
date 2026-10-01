const Order = require('../models/Order');
const mongoose = require('mongoose');

// Memory storage fallback
let memoryOrders = [
  {
    _id: 'ord_101',
    customerName: '@cliente_demo',
    itemsSummary: '1x Café Espresso ($45.00), 1x Frappé Caramel ($65.00)',
    total: 110.00,
    status: 'En Preparación',
    createdAt: new Date().toISOString()
  }
];

// GET: Obtener todos los pedidos
exports.getOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, source: 'mongodb', data: orders });
    } else {
      return res.json({ success: true, source: 'memory', data: memoryOrders });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST: Crear un nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const { customerName, itemsSummary, total, status } = req.body;

    if (!itemsSummary || total === undefined || total === null) {
      return res.status(400).json({ success: false, message: 'El resumen del pedido y el total son obligatorios.' });
    }

    const newOrderData = {
      customerName: customerName && String(customerName).trim() !== '' ? String(customerName).trim() : '@cliente',
      itemsSummary: String(itemsSummary).trim(),
      total: Number(total),
      status: status || 'Pendiente',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const createdOrder = await Order.create(newOrderData);
      return res.status(201).json({ success: true, source: 'mongodb', data: createdOrder });
    } else {
      const newOrder = {
        _id: 'ord_' + Date.now() + Math.random().toString(36).substring(2, 6),
        ...newOrderData
      };
      memoryOrders.unshift(newOrder);
      return res.status(201).json({ success: true, source: 'memory', data: newOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT: Actualizar un pedido por ID (Modificar estado o cliente)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, itemsSummary, total, status } = req.body;

    const updateData = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (itemsSummary !== undefined) updateData.itemsSummary = itemsSummary;
    if (total !== undefined) updateData.total = Number(total);
    if (status !== undefined) updateData.status = status;

    if (mongoose.connection.readyState === 1) {
      const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado en MongoDB.' });
      }
      return res.json({ success: true, source: 'mongodb', data: updatedOrder });
    } else {
      const orderIndex = memoryOrders.findIndex(item => String(item._id) === String(id));
      if (orderIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
      }
      memoryOrders[orderIndex] = { ...memoryOrders[orderIndex], ...updateData };
      return res.json({ success: true, source: 'memory', data: memoryOrders[orderIndex] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE: Eliminar un pedido por ID
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deleted = await Order.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado en MongoDB.' });
      }
      return res.json({ success: true, message: 'Pedido eliminado con éxito de MongoDB.' });
    } else {
      const initialLen = memoryOrders.length;
      memoryOrders = memoryOrders.filter(item => String(item._id) !== String(id));
      if (memoryOrders.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
      }
      return res.json({ success: true, message: 'Pedido eliminado con éxito.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
