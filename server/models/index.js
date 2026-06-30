const { sequelize } = require('../config/db');
const User = require('./User');
const Donor = require('./Donor');
const BloodRequest = require('./BloodRequest');

// ─── Associations ───────────────────────────────────────────────

// User ↔ Donor (One-to-One)
User.hasOne(Donor, { foreignKey: 'userId', as: 'donorProfile', onDelete: 'CASCADE' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ BloodRequest (One-to-Many)
User.hasMany(BloodRequest, { foreignKey: 'requestedBy', as: 'bloodRequests', onDelete: 'CASCADE' });
BloodRequest.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });

module.exports = {
  sequelize,
  User,
  Donor,
  BloodRequest,
};
