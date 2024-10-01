const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa la conexión a la base de datos

// Definición del modelo de Empleados
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'employee'),
    allowNull: false,
    defaultValue: 'employee'
  },
  area: {
    type: DataTypes.ENUM('Informatica', 'Contabilidad', 'Administración'),
    allowNull: false,
    defaultValue: 'Informatica'
  }
}, {
  tableName: 'empleados',
  timestamps: false
});

module.exports = User;