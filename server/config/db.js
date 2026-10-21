const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: (() => {
      // Allow disabling SSL for local development with DB_SSL=false or when targeting localhost without DB_SSL specified
      const useSSL = process.env.DB_SSL !== undefined 
        ? process.env.DB_SSL === 'true' 
        : (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST));

      return useSSL ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      } : {};
    })(),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
