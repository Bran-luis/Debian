const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./usuario'); 

// Definición del modelo de AsistenciaEmpleados
const AsistenciaEmpleados = sequelize.define('AsistenciaEmpleados', {
  empleado_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // Referencia al modelo de usuario (modelo importado)
      key: 'id',
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('Presente', 'Ausente', 'Tarde'),
    allowNull: false,
  },
  nivelAlcohol: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true, // Permite valores nulos Revisar esto
  },
}, {
  tableName: 'asistenciasempleados',
  timestamps: false,
});

// Definir la relación entre las tablas (User y AsistenciaEmpleados)
User.hasMany(AsistenciaEmpleados, { foreignKey: 'empleado_id' });
AsistenciaEmpleados.belongsTo(User, { foreignKey: 'empleado_id' });

module.exports = AsistenciaEmpleados;