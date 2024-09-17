const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

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
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'employee'  // Por defecto es empleado
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Si quieres que sea opcional
    references: {
      model: 'areas',
      key: 'id'
    }
  }
}, {
  tableName: 'empleados', // Asegúrate de que el nombre de la tabla es correcto
  timestamps: false,
});

// Hashea la contraseña antes de guardar el usuario
// User.beforeCreate(async (user) => {
//   if (user.changed('password')) {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//   }
// });

module.exports = User;