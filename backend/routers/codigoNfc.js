const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Importa el modelo

// Ruta para crear un nuevo usuario con codigoNfc encriptado
router.post('/add-user', async (req, res) => {
  const { username, password, role, area, codigoNfc } = req.body;
  
  try {
    const newUser = await User.create({ 
      username, 
      password, 
      role, 
      area, 
      codigoNfc 
    });
    
    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
});

module.exports = router;
