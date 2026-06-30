const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BloodRequest = sequelize.define(
  'BloodRequest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    bloodGroup: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hospital: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urgency: {
      type: DataTypes.ENUM('normal', 'urgent', 'critical'),
      defaultValue: 'normal',
    },
    status: {
      type: DataTypes.ENUM('pending', 'fulfilled', 'cancelled'),
      defaultValue: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = BloodRequest;
