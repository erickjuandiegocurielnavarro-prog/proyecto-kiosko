const Product = require('../models/Product');
const mongoose = require('mongoose');

// Dataset inicial en memoria fallback
let memoryProducts = [
  {
    _id: 'prod_1',
    name: "Café Espresso & Cappuccino Gourmet",
    category: "cafe",
    categoryLabel: "Café",
    price: 45.00,
    image: "images/cafe.jpg",
    description: "Preparado con selección especial de granos 100% arábica recién molidos.",
    badgeClass: "chip-cafe"
  },
  {
    _id: 'prod_2',
    name: "Frappé Caramel Supreme",
    category: "frappe",
    categoryLabel: "Frappé",
    price: 65.00,
    image: "images/frappe.jpg",
    description: "Bebida helada a base de espresso doble, crema batida y caramelo artesanal.",
    badgeClass: "chip-frappe"
  },
  {
    _id: 'prod_3',
    name: "Combo Desayuno Gourmet",
    category: "combos",
    categoryLabel: "Combos",
    price: 95.00,
    image: "images/combos.jpg",
    description: "Café caliente + Croissant de mantequilla recién horneado + Jugo natural.",
    badgeClass: "chip-combos"
  },
  {
    _id: 'prod_4',
    name: "Selección de Pan Artesanal y Baguettes",
    category: "pan",
    categoryLabel: "Pan en General",
    price: 35.00,
    image: "images/pan.jpg",
    description: "Variedad de pan rústico de masa madre, baguettes crujientes y repostería.",
    badgeClass: "chip-pan"
  }
];

// Mapeo de etiqueta para categorías
const categoryLabelMap = {
  cafe: 'Café',
  frappe: 'Frappé',
  combos: 'Combos',
  pan: 'Pan en General'
};

const badgeClassMap = {
  cafe: 'chip-cafe',
  frappe: 'chip-frappe',
  combos: 'chip-combos',
  pan: 'chip-pan'
};

// GET: Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let products = await Product.find().sort({ createdAt: -1 });
      
      // Sembrar datos iniciales si la colección está vacía
      if (products.length === 0) {
        await Product.insertMany(memoryProducts.map(p => ({
          name: p.name,
          category: p.category,
          categoryLabel: p.categoryLabel,
          price: p.price,
          image: p.image,
          description: p.description,
          badgeClass: p.badgeClass
        })));
        products = await Product.find().sort({ createdAt: -1 });
      }
      return res.json({ success: true, source: 'mongodb', data: products });
    } else {
      return res.json({ success: true, source: 'memory', data: memoryProducts });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST: Crear nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, image, description } = req.body;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ success: false, message: 'El nombre, categoría y precio son obligatorios.' });
    }

    const catKey = String(category).toLowerCase();
    const newProductData = {
      name: String(name).trim(),
      category: catKey,
      categoryLabel: categoryLabelMap[catKey] || 'Producto',
      price: Number(price),
      image: image || 'images/cafe.jpg',
      description: description ? String(description).trim() : 'Sin descripción',
      badgeClass: badgeClassMap[catKey] || 'chip-cafe',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Product.create(newProductData);
      return res.status(201).json({ success: true, source: 'mongodb', data: created });
    } else {
      const newProduct = {
        _id: 'prod_' + Date.now() + Math.random().toString(36).substring(2, 6),
        ...newProductData
      };
      memoryProducts.unshift(newProduct);
      return res.status(201).json({ success: true, source: 'memory', data: newProduct });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT: Actualizar un producto por ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, image, description } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (category !== undefined) {
      const catKey = String(category).toLowerCase();
      updateData.category = catKey;
      updateData.categoryLabel = categoryLabelMap[catKey] || 'Producto';
      updateData.badgeClass = badgeClassMap[catKey] || 'chip-cafe';
    }
    if (price !== undefined) updateData.price = Number(price);
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = String(description).trim();

    if (mongoose.connection.readyState === 1) {
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado en MongoDB.' });
      }
      return res.json({ success: true, source: 'mongodb', data: updated });
    } else {
      const idx = memoryProducts.findIndex(p => String(p._id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }
      memoryProducts[idx] = { ...memoryProducts[idx], ...updateData };
      return res.json({ success: true, source: 'memory', data: memoryProducts[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE: Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado en MongoDB.' });
      }
      return res.json({ success: true, message: 'Producto eliminado con éxito de MongoDB.' });
    } else {
      const initialLen = memoryProducts.length;
      memoryProducts = memoryProducts.filter(p => String(p._id) !== String(id));
      if (memoryProducts.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
      }
      return res.json({ success: true, message: 'Producto eliminado con éxito.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
