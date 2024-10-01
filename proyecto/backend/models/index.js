const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// Importar los modelos
const usuario = require('./usuario');
const AsistenciaEmpleados = require('./AsistenciaEmpleados');

// Crear asociaciones si es necesario
usuario.hasMany(AsistenciaEmpleados, { foreignKey: 'empleado_id' });
AsistenciaEmpleados.belongsTo(usuario, { foreignKey: 'empleado_id' });

// Exportar los modelos
module.exports = {
  usuario,
  AsistenciaEmpleados,
  sequelize
};