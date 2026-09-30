# 🏪 Proyecto Kiosko

Sistema para Kiosko interactivo desarrollado con Node.js, Express, MongoDB y Frontend web (HTML, CSS, JavaScript).

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [MongoDB](https://www.mongodb.com/) (Local o MongoDB Atlas)
- [Git](https://git-scm.com/)

---

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio** (para tu compañero):
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd mongodb
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz del proyecto con la configuración de MongoDB y puerto:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/kiosko
   ```

4. **Iniciar el Servidor**:
   ```bash
   npm start
   ```
   Abre tu navegador en `http://localhost:3000`

---

## 👥 Guía para Colaborar en Equipo

### Opción 1: Edición Simultánea en Tiempo Real (VS Code Live Share)
1. Instalen la extensión **Live Share** en VS Code.
2. Uno inicia la sesión compartida y envía el enlace a su compañero.

### Opción 2: Trabajo con Ramas en Git (Recomendado)
1. Crear una nueva rama antes de programar una nueva función:
   ```bash
   git checkout -b feature/nombre-funcion
   ```
2. Guardar y subir cambios:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin feature/nombre-funcion
   ```
3. Hacer un Pull Request en GitHub hacia la rama `main`.
