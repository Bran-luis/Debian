const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
      const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
      req.user = verified;
      next();
  } catch (err) {
      res.status(400).json({ error: 'Token inválido' });
  }
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    const { role } = req.user; // req.user viene del middleware de autenticación JWT

    console.log(`Rol del usuario: ${role}`);
    console.log(`Roles permitidos: ${roles}`);

    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta ruta' });
    }

    next();
  };
};

module.exports = verifyToken;