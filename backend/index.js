require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authRoutes = require('./routers/auth');
const alcoholimetroRoutes = require('./routers/alcoholimetro');
const verifyToken = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

const cors = require('cors');
app.use(cors());

// Middleware para manejar el tamaño de los encabezados y solicitudes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para verificar el tamaño de los encabezados
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use((req, res, next) => {
  console.log('Encabezados de solicitud:', req.headers);
  next();
});

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/alcoholimetro', verifyToken, alcoholimetroRoutes);

sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});