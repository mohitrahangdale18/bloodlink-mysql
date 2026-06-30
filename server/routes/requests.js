const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/requestController');

// POST /api/requests — Create a new blood request (protected)
router.post('/', auth, createRequest);

// GET /api/requests — List all requests with optional filters (protected)
router.get('/', auth, getAllRequests);

// GET /api/requests/:id — Get single request with requester details (protected)
router.get('/:id', auth, getRequestById);

// PATCH /api/requests/:id/status — Update request status (protected)
router.patch('/:id/status', auth, updateRequestStatus);

module.exports = router;
