/**
 * Migration: Add latitude and longitude columns to Donors table.
 * Safe migration: Checks if columns exist before adding, preserves all data.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Donors');
    
    if (!tableInfo.latitude) {
      await queryInterface.addColumn('Donors', 'latitude', {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Added latitude column to Donors table.');
    }

    if (!tableInfo.longitude) {
      await queryInterface.addColumn('Donors', 'longitude', {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Added longitude column to Donors table.');
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable('Donors');

    if (tableInfo.latitude) {
      await queryInterface.removeColumn('Donors', 'latitude');
      console.log('Reverted latitude column from Donors table.');
    }

    if (tableInfo.longitude) {
      await queryInterface.removeColumn('Donors', 'longitude');
      console.log('Reverted longitude column from Donors table.');
    }
  },
};
