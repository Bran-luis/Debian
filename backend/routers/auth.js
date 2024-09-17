const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../middlewares/authMiddleware');
const User = require('../models/usuario');
const router = express.Router();

// Crear un nuevo usuario con validación
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['admin', 'employee']).withMessage('El rol no es válido'),
  // Aquí puedes agregar la validación para area_id si es relevante
  // body('area_id').optional().isInt().withMessage('El ID de área debe ser un número entero')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, area_id } = req.body;

  console.log(`Creando usuario con el rol: ${role}`); // Agrega esta línea para depuración

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Crea el nuevo usuario sin hashear la contraseña
    const newUser = await User.create({
      username,
      password, // Contraseña en texto plano
      role,
      area_id // Incluye area_id si es necesario
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario creado exitosamente', token, role: newUser.role });
  } catch (error) {
    console.error('Error al crear usuario:', error); // Mejora la depuración
    res.status(500).json({ error: 'Error del servidor' });
  }
});

const verifyRole = (roles) => {
  return (req, res, next) => {
    const { role } = req.user; // req.user viene del middleware de autenticación JWT

    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta ruta' });
    }

    next();
  };
};

// Ruta accesible solo para administradores
router.get('/admin/dashboard', verifyToken, verifyRole(['admin']), (req, res) => {
  res.json({ message: 'Bienvenido al panel de administrador' });
});

// Ruta accesible tanto para empleados como para administradores
router.get('/dashboard', verifyToken, verifyRole(['admin', 'employee']), (req, res) => {
  res.json({ message: 'Bienvenido al panel de empleados' });
});

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'area_id'] // Incluye 'area_id'
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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // Comparar la contraseña proporcionada directamente
    if (user.password !== password) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;