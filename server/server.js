const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const { testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const requestRoutes = require('./routes/requests');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🩸 BloodLink API is running',
    version: '1.0.0',
  });
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync all models (auto-create/update tables)
    await sequelize.sync({ alter: true });
    console.log('✅ All models synced with database.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🩸 BloodLink server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Database:    ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
