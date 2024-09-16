const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  console.log('Token recibido:', token);

  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    console.log('Token verificado:', verified);
    req.user = verified;
    next();
  } catch (err) {
    console.error('Error al verificar token:', err);
    res.status(400).json({ error: 'Token inválido' });
  }
};


module.exports = verifyToken;
