const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mi_bd";
  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado a MongoDB con éxito en:", uri);
    return true;
  } catch (err) {
    console.log("⚠️ Servidor corriendo en modo fallback local (Sin conexión activa a MongoDB)");
    return false;
  }
};

module.exports = connectDB;
