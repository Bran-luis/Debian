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
  },
  codigoNfc: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'empleados',
  timestamps: false,
  hooks: {
    
    beforeCreate: async (user) => {
      if (user.codigoNfc) {
        const salt = await bcrypt.genSalt(10);
        user.codigoNfc = await bcrypt.hash(user.codigoNfc, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.codigoNfc && user.changed('codigoNfc')) {
        const salt = await bcrypt.genSalt(10);
        user.codigoNfc = await bcrypt.hash(user.codigoNfc, salt);
      }
    }
  }
});


User.prototype.validarCodigoNfc = async function(codigoNfc) {
  return await bcrypt.compare(codigoNfc, this.codigoNfc);
};

module.exports = User;
