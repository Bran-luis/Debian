// routers/asistencias.js
const express = require('express');
const router = express.Router();
const AsistenciaEmpleados = require('../models/AsistenciaEmpleados');
const User = require('../models/usuario'); 
const {Op, Sequelize } = require('sequelize');

// Ruta para registrar la asistencia
router.post('/registrar', async (req, res) => {
  const { empleado_id, estado } = req.body;

  if (!empleado_id || !estado) {
    return res.status(400).json({ error: 'Faltan datos necesarios para registrar la asistencia.' });
  }

  try {
    // Registrar la asistencia del empleado con la fecha actual
    const nuevaAsistencia = await AsistenciaEmpleados.create({
      empleado_id,
      fecha: new Date(), // Fecha actual
      estado, // Estado de la asistencia (Presente, Ausente, Tarde)
    });

    res.status(201).json({ message: 'Asistencia registrada exitosamente', asistencia: nuevaAsistencia });
  } catch (error) {
    console.error('Error al registrar la asistencia:', error);
    res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
});

// Ruta para obtener las últimas asistencias de cada empleado
router.get('/ultimas', async (req, res) => {
  try {
    const asistencias = await AsistenciaEmpleados.findAll({
      attributes: [
        'empleado_id',
        [Sequelize.fn('MAX', Sequelize.col('fecha')), 'fecha'],
        'estado',
        'nivelAlcohol',
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'area'], // Asegúrate de incluir estos atributos
        },
      ],
      group: ['empleado_id', 'User.id', 'User.username', 'User.area', 'estado', 'nivelAlcohol'], // Asegúrate de incluir todos los campos no agregados
      order: [[Sequelize.fn('MAX', Sequelize.col('fecha')), 'DESC']],
    });

    res.json(asistencias);
  } catch (error) {
    console.error('Error al obtener las asistencias:', error);
    res.status(500).json({ error: 'Error al obtener las asistencias' });
  }
});

module.exports = router;