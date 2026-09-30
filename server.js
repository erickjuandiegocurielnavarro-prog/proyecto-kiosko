const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/db');
const latteRoutes = require('./src/routes/latteRoutes');
const productRoutes = require('./src/routes/productRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conexión a Base de Datos (MongoDB)
connectDB();

// Servir archivos estáticos (public, views, css, js, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Rutas de la API (REST CRUD)
app.use('/api/latte', latteRoutes);
app.use('/api/productos', productRoutes);

// Manejador principal para la vista HTML (Garantiza que no dé error ENOENT)
const renderIndexHtml = (req, res) => {
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  const viewsIndexPath = path.join(__dirname, 'views', 'index.html');

  if (require('fs').existsSync(publicIndexPath)) {
    return res.sendFile(publicIndexPath);
  } else if (require('fs').existsSync(viewsIndexPath)) {
    return res.sendFile(viewsIndexPath);
  } else {
    return res.status(404).send('<h1>Página no encontrada. Verifica index.html</h1>');
  }
};

app.get('/', renderIndexHtml);
app.use((req, res) => renderIndexHtml(req, res));

app.listen(port, () => {
  console.log(`🚀 Servidor de Café & Panadería Kiosko listo en http://localhost:${port}`);
});
