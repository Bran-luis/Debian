const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middlewares/authMiddleware');
const User = require('../models/usuario');
const router = express.Router();

// Crear un nuevo usuario con validación
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['admin', 'employee']).withMessage('El rol no es válido'),
  body('area').isIn(['Informatica', 'Contabilidad', 'Administración']).withMessage('Area no asignada'),
  body('codigoNfc').notEmpty().withMessage('El código NFC es obligatorio') 
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, area, codigoNfc } = req.body; 

  console.log(`Creando usuario con el rol: ${role}, y código NFC: ${codigoNfc}`); 

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Crea el nuevo usuario incluyendo el codigoNfc
    const newUser = await User.create({
      username,
      password, 
      role,
      area,
      codigoNfc 
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, area: newUser.area }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario creado exitosamente', token, role: newUser.role });
  } catch (error) {
    console.error('Error al crear usuario:', error); 
    res.status(500).json({ error: 'Error del servidor' });
  }
});

const verifyRole = (roles) => {
  return (req, res, next) => {
    // req.user viene del middleware de autenticación JWT
    const { role } = req.user; 

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
      attributes: ['id', 'username', 'role', 'area', 'codigoNfc'] 
    });
    res.json(users);
  } catch (err) {
    console.error('Error al obtener los usuarios:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar un usuario por su ID
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.destroy({ where: { id: userId } });
    
    if (deletedUser) {
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener un usuario por ID
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

// Login de usuario
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Generar el token de autenticación
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar la respuesta con el ID del usuario
    res.json({
      token,
      userId: user.id, 
      role: user.role,
    });
  } catch (error) {
    console.error('Error en la solicitud de inicio de sesión:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar un usuario por su ID
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, role, area, codigoNfc } = req.body; 

    // Encuentra al usuario y actualiza sus datos, incluido el código NFC
    const updatedUser = await User.update(
      { username, password, role, area, codigoNfc },  
      { where: { id: userId } }
    );

    if (updatedUser) {
      res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }

  
});
// Buscar un usuario por su código NFC
router.get('/users/nfc/:codigoNfc', async (req, res) => {
  const { codigoNfc } = req.params;

  try {
    const user = await User.findOne({ where: { codigoNfc } });
    
    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error al buscar usuario por código NFC:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
