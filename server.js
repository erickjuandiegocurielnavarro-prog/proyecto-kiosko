const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos de la carpeta public y raíz
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_bd";
let isMongoConnected = false;

// Esquema Mongoose flexible para la colección de MongoDB
const latteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  precio: { type: Number, required: true },
  user: { type: String, default: '@anonimo' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'lattes', strict: false });

const LatteModel = mongoose.model('Latte', latteSchema);

// Memory fallback en caso de no tener MongoDB activo localmente en el instante de ejecución
let memoryStorage = [
  {
    _id: '6a9ecf625840bcc2b1397a70',
    name: 'latte',
    precio: 40,
    user: '@anonimo',
    createdAt: new Date().toISOString()
  }
];

mongoose.connect(uri)
  .then(async () => {
    isMongoConnected = true;
    console.log("Conectado a MongoDB con éxito en:", uri);
    
    // Sembrar dato inicial si la colección está vacía
    try {
      const count = await LatteModel.countDocuments();
      if (count === 0) {
        await LatteModel.create({
          _id: '6a9ecf625840bcc2b1397a70',
          name: 'latte',
          precio: 40,
          user: '@anonimo'
        });
        console.log("Documento inicial insertado en MongoDB con éxito");
      }
    } catch (e) {
      console.log("Nota al inicializar semilla MongoDB:", e.message);
    }
  })
  .catch(err => {
    isMongoConnected = false;
    console.log("Servidor corriendo con almacenamiento local fallback. (Sin conexión activa a MongoDB local)");
  });

// API para obtener todos los registros de la colección MongoDB
app.get('/api/latte', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await LatteModel.find().sort({ createdAt: -1 });
      return res.json({ success: true, source: 'mongodb', data: items });
    } else {
      return res.json({ success: true, source: 'memory', data: memoryStorage });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API para insertar un nuevo registro en MongoDB
app.post('/api/latte', async (req, res) => {
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

    if (isMongoConnected) {
      const createdItem = await LatteModel.create(newItemData);
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
});

// API para eliminar un registro por ID
app.delete('/api/latte/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const deleted = await LatteModel.findByIdAndDelete(id);
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
});

// API de productos exclusivos para las 4 categorías
app.get('/api/productos', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Café Espresso & Cappuccino Gourmet",
      category: "cafe",
      categoryLabel: "Café",
      price: 45.00,
      image: "images/cafe.jpg",
      description: "Preparado con selección especial de granos 100% arábica recién molidos."
    },
    {
      id: 2,
      name: "Frappé Caramel Supreme",
      category: "frappe",
      categoryLabel: "Frappé",
      price: 65.00,
      image: "images/frappe.jpg",
      description: "Bebida helada a base de espresso doble, crema batida y caramelo artesanal."
    },
    {
      id: 3,
      name: "Combo Desayuno Gourmet",
      category: "combos",
      categoryLabel: "Combos",
      price: 95.00,
      image: "images/combos.jpg",
      description: "Café caliente + Croissant de mantequilla recién horneado + Jugo natural."
    },
    {
      id: 4,
      name: "Selección de Pan Artesanal y Baguettes",
      category: "pan",
      categoryLabel: "Pan en General",
      price: 35.00,
      image: "images/pan.jpg",
      description: "Variedad de pan rústico de masa madre, baguettes crujientes y repostería."
    }
  ]);
});

// Servir la aplicación cliente HTML para cualquier ruta de navegación
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor de Café & Panadería corriendo en http://localhost:${port}`);
});