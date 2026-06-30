const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register — Register a new user
router.post('/register', register);

// POST /api/auth/login — Login and get JWT
router.post('/login', login);

module.exports = router;
