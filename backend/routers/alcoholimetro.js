const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Datos del alcoholímetro');
});

router.post('/registrar', (req, res) => {
  const { empleadoId, resultado } = req.body;
  res.json({ mensaje: 'Resultado registrado', empleadoId, resultado });
});

module.exports = router;