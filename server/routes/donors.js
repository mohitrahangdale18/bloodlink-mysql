const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProfile,
  createProfile,
  updateProfile,
  toggleAvailability,
  searchDonors,
} = require('../controllers/donorController');

// GET /api/donors/search — Search available donors (protected)
router.get('/search', auth, searchDonors);

// GET /api/donors/profile — Get logged-in user's donor profile (protected)
router.get('/profile', auth, getProfile);

// POST /api/donors/profile — Create donor profile (protected)
router.post('/profile', auth, createProfile);

// PUT /api/donors/profile — Update donor profile (protected)
router.put('/profile', auth, updateProfile);

// PATCH /api/donors/availability — Toggle availability (protected)
router.patch('/availability', auth, toggleAvailability);

module.exports = router;
