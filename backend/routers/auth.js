const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/usuario');
const router = express.Router();

//crear un nuevo usuario con validación
router.post('/register', [
  // Validaciones
  body('username')
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .not()
    .isEmpty()
    .withMessage('El nombre de usuario no puede estar vacío'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  // Validar los resultados de las validaciones
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Crear el nuevo usuario con la contraseña en texto claro
    const newUser = await User.create({ username, password });

    // Generar el token JWT
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario creado exitosamente', token });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


//obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username']
    });
    res.json(users);
  } catch (err) {
    console.error('Error al obtener los usuarios:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//eliminar un usuario por ID
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    await User.destroy({ where: { id } });
    res.json({ message: 'Usuario eliminado correctamente' });

  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//obtener un usuario por ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error al obtener el usuario:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body);

  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const existingUser = await User.findOne({ where: { username } });
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    

    // Generar el token JWT y añadir el rol al payload
    const token = jwt.sign({ id: existingUser.id, rol: existingUser.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar el token y el rol del usuario al frontend
    res.status(200).json({ message: 'Inicio de sesión exitoso', token, user: { username: existingUser.username, rol: existingUser.rol } });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


module.exports = router;