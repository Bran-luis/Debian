const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const usuario = require('./usuario');
const AsistenciaEmpleados = require('./AsistenciaEmpleados');

usuario.hasMany(AsistenciaEmpleados, { foreignKey: 'empleado_id' });
AsistenciaEmpleados.belongsTo(usuario, { foreignKey: 'empleado_id' });

module.exports = {
  usuario,
  AsistenciaEmpleados,
  sequelize
};