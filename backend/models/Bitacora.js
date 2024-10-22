const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bitacora = sequelize.define('bitacora_movimientos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seccion: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  detalle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: false, // Desactivar timestamps automáticos
  tableName: 'bitacora_movimientos', // Nombre de la tabla en la base de datos
});

module.exports = Bitacora;