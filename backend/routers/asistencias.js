const express = require('express');
const router = express.Router();
const AsistenciaEmpleados = require('../models/AsistenciaEmpleados');
const Bitacora = require('../models/Bitacora');
const User = require('../models/usuario'); 
const {Op, Sequelize } = require('sequelize');
const { sendEmail } = require('../config/mailer');


// Ruta para registrar la asistencia
router.post('/registrar', async (req, res) => {
  const { codigoNfc, estado, nivelAlcohol } = req.body;

  console.log('Datos recibidos para registrar asistencia:', { codigoNfc, estado, nivelAlcohol });

  if (!codigoNfc || !estado || !nivelAlcohol) {
    return res.status(400).json({ error: 'Faltan datos necesarios para registrar la asistencia. Asegúrate de enviar codigoNfc, estado y nivelAlcohol.' });
  }

  const nivelesPermitidos = ['Bajo', 'Medio', 'Alto'];
  if (!nivelesPermitidos.includes(nivelAlcohol)) {
    return res.status(400).json({ error: 'Nivel de alcohol no válido. Los valores permitidos son: Bajo, Medio, Alto.' });
  }

  try {
    const usuario = await User.findOne({ where: { codigoNfc } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado. Asegúrate de que el codigoNfc sea correcto.' });
    }

    const nuevaAsistencia = await AsistenciaEmpleados.create({
      empleado_id: usuario.id,
      fecha: new Date(),
      estado,
      nivelAlcohol,
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
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'area_id'],
        },
      ],
      group: ['empleado_id', 'User.id', 'User.username', 'User.area_id'],
      order: [[Sequelize.fn('MAX', Sequelize.col('fecha')), 'DESC']],
      subQuery: false
    });

    const ultimasAsistencias = await Promise.all(
      asistencias.map(async (asistencia) => {
        const ultimaAsistencia = await AsistenciaEmpleados.findOne({
          where: {
            empleado_id: asistencia.empleado_id,
            fecha: asistencia.getDataValue('fecha'),
          },
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'area_id'],
            },
          ],
        });
        return ultimaAsistencia;
      })
    );

    res.json(ultimasAsistencias);
  } catch (error) {
    console.error('Error al obtener las asistencias:', error);
    res.status(500).json({ error: 'Error al obtener las asistencias', details: error.message });
  }
});

// Ruta para obtener reporte de asistencia por nivel de alcohol
router.get('/reporte/:empleado_id', async (req, res) => {
  const { empleado_id } = req.params;

  try {
    // Verifica si el usuario existe antes de realizar el conteo
    const usuario = await User.findByPk(empleado_id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const conteo = await AsistenciaEmpleados.count({
      where: {
        empleado_id: empleado_id,
        nivelAlcohol: {
          [Op.or]: ['Medio', 'Alto']
        }
      }
    });

    if (conteo >= 3) {
      res.json({
        message: `El empleado con ID ${empleado_id} ha sido reportado ${conteo} veces con un nivel de alcohol Medio o Alto.`,
        conteo: conteo,
        empleado_id: empleado_id
      });
    } else {
      res.json({
        message: `El empleado con ID ${empleado_id} no ha alcanzado el límite de reportes.`,
        conteo: conteo,
        empleado_id: empleado_id
      });
    }
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte.' });
  }
  await registrarMovimiento(empleado_id, 'Reportes', 'Generar', `Se genero un reporte al empleado con ID ${empleado_id}.`);
});


// Ruta para obtener el historial de asistencias de un empleado
router.get('/historial/:empleado_id', async (req, res) => {
  const { empleado_id } = req.params;

  try {
    const historial = await AsistenciaEmpleados.findAll({
      where: { empleado_id: empleado_id },
      order: [['fecha', 'DESC']],
    });

    if (historial.length > 0) {
      res.json(historial);
    } else {
      res.status(404).json({ message: 'No se encontraron registros de asistencias para este empleado.' });
    }
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
});

// Ruta para enviar correo
router.post('/enviar-correo', async (req, res) => {
  const { empleado_id } = req.body;

  if (!empleado_id) {
    return res.status(400).json({ error: 'Falta el empleado_id.' });
  }

  try {
    const conteo = await AsistenciaEmpleados.count({
      where: {
        empleado_id: empleado_id,
        nivelAlcohol: {
          [Op.or]: ['Medio', 'Alto']
        }
      }
    });

    const usuario = await User.findOne({ where: { id: empleado_id }, attributes: ['correo'] });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (conteo >= 3) {
      await sendEmail(usuario.correo, 'Reporte de Asistencia', `Has sido reportado ${conteo} veces con un nivel de alcohol Medio o Alto.`);
      
      await registrarMovimiento(empleado_id, 'Correos', 'Enviar', `Se envió un correo al empleado con ID ${empleado_id}.`);

      res.json({ message: `Se ha enviado un correo al empleado con ID ${empleado_id}.` });
    } else {
      res.json({ message: `El empleado con ID ${empleado_id} no ha alcanzado el límite de reportes.` });
    }
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

// Función para registrar movimiento en la bitácora
const registrarMovimiento = async (empleado_id, seccion, accion, detalle) => {
  try {
    await Bitacora.create({
      empleado_id,
      seccion,
      accion,
      detalle,
      fecha_movimiento: new Date(),
    });
  } catch (error) {
    console.error('Error al registrar movimiento en la bitácora:', error);
  }
};

// Ruta para obtener la bitácora
router.get('/bitacora', async (req, res) => {
  try {
    const bitacora = await Bitacora.findAll({
      order: [['fecha_movimiento', 'DESC']],
    });
    res.json(bitacora);
  } catch (error) {
    console.error('Error al obtener la bitácora:', error);
    res.status(500).json({ error: 'Error al obtener la bitácora.' });
  }
});

// Ruta para eliminar un movimiento en la bitácora
router.delete('/bitacora/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await Bitacora.destroy({
      where: { id },
    });

    if (resultado === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado en la bitácora.' });
    }

    res.json({ message: 'Movimiento eliminado de la bitácora exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el movimiento de la bitácora:', error);
    res.status(500).json({ error: 'Error al eliminar el movimiento de la bitácora.' });
  }
});

module.exports = router;