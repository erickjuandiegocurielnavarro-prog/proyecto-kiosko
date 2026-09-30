const Latte = require('../models/Latte');
const mongoose = require('mongoose');

// Memory storage fallback
let memoryStorage = [
  {
    _id: '6a9ecf625840bcc2b1397a70',
    name: 'latte',
    precio: 40,
    user: '@anonimo',
    createdAt: new Date().toISOString()
  }
];

// GET: Obtener todos los lattes
exports.getLattes = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const items = await Latte.find().sort({ createdAt: -1 });
      return res.json({ success: true, source: 'mongodb', data: items });
    } else {
      return res.json({ success: true, source: 'memory', data: memoryStorage });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST: Crear un nuevo registro
exports.createLatte = async (req, res) => {
  try {
    const { name, precio, user } = req.body;

    if (!name || precio === undefined || precio === null || precio === '') {
      return res.status(400).json({ success: false, message: 'El nombre y el precio son obligatorios.' });
    }

    const newItemData = {
      name: String(name).trim(),
      precio: Number(precio),
      user: user && String(user).trim() !== '' ? String(user).trim() : '@anonimo',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const createdItem = await Latte.create(newItemData);
      return res.status(201).json({ success: true, source: 'mongodb', data: createdItem });
    } else {
      const newItem = {
        _id: 'mongo_' + Date.now() + Math.random().toString(36).substring(2, 7),
        ...newItemData
      };
      memoryStorage.unshift(newItem);
      return res.status(201).json({ success: true, source: 'memory', data: newItem });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE: Eliminar un registro por ID
exports.deleteLatte = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deleted = await Latte.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Registro no encontrado en MongoDB.' });
      }
      return res.json({ success: true, message: 'Registro eliminado con éxito de MongoDB.' });
    } else {
      const initialLen = memoryStorage.length;
      memoryStorage = memoryStorage.filter(item => String(item._id) !== String(id));
      if (memoryStorage.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Registro no encontrado.' });
      }
      return res.json({ success: true, message: 'Registro eliminado con éxito.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
