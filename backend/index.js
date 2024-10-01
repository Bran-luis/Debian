require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database'); // Configuración de Sequelize
const authRoutes = require('./routers/auth'); // Importación de rutas de autenticación
const asistenciasRouters = require('./routers/asistencias'); // Importación de rutas de asistencias
const verifyToken = require('./middlewares/authMiddleware'); // Middleware para verificar el token

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS y parseo de solicitudes
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de seguridad básica
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Registro de encabezados de solicitud para depuración
app.use((req, res, next) => {
  console.log('Encabezados de solicitud:', req.headers);
  next();
});

// Registro de rutas
app.use('/api/auth', authRoutes); // Ruta de autenticación
app.use('/api/asistencias', asistenciasRouters); // Ruta para asistencias

// Sincronización de la base de datos
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciación del servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});