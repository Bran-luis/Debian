const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// Definición del modelo de Empleados
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false, 
    validate: {
      isEmail: true
    }
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
  area_id: {
    type: DataTypes.ENUM('Informatica', 'Contabilidad', 'Administración'),
    allowNull: false,
    defaultValue: 'Informatica'
  },
  codigoNfc: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'empleados',
  timestamps: false
});

User.prototype.validarCodigoNfc = async function(codigoNfc) {
  return await bcrypt.compare(codigoNfc, this.codigoNfc);
};

module.exports = User;