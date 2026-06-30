const { Op } = require('sequelize');
const { BloodRequest, User } = require('../models');

/**
 * POST /api/requests
 * Create a new blood request.
 */
const createRequest = async (req, res) => {
  try {
    const { bloodGroup, city, hospital, contactNumber, urgency } = req.body;

    // Validate required fields
    if (!bloodGroup || !city || !hospital || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bloodGroup, city, hospital, and contactNumber.',
      });
    }

    const bloodRequest = await BloodRequest.create({
      requestedBy: req.user.id,
      bloodGroup,
      city,
      hospital,
      contactNumber,
      urgency: urgency || 'normal',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      data: bloodRequest,
    });
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    console.error('Create request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/requests
 * List all blood requests with optional filters.
 */
const getAllRequests = async (req, res) => {
  try {
    const { status, bloodGroup, city } = req.query;

    // Build dynamic where clause from query params
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }
    if (bloodGroup) {
      whereClause.bloodGroup = bloodGroup;
    }
    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }

    const requests = await BloodRequest.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phone', 'city'],
        },
      ],
      order: [
        // Critical requests first, then urgent, then normal
        [
          BloodRequest.sequelize.literal(
            `CASE urgency WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 WHEN 'normal' THEN 3 END`
          ),
          'ASC',
        ],
        ['createdAt', 'DESC'],
      ],
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/requests/:id
 * Get a single blood request by ID with requester details.
 */
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const bloodRequest = await BloodRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phone', 'city', 'bloodGroup'],
        },
      ],
    });

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: bloodRequest,
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/requests/:id/status
 * Update the status of a blood request.
 */
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status (pending, fulfilled, or cancelled).',
      });
    }

    const validStatuses = ['pending', 'fulfilled', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const bloodRequest = await BloodRequest.findByPk(id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    bloodRequest.status = status;
    await bloodRequest.save();

    return res.status(200).json({
      success: true,
      data: bloodRequest,
      message: `Request status updated to '${status}'.`,
    });
  } catch (error) {
    console.error('Update request status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
};
