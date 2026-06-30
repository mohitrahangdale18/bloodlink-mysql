const { Op } = require('sequelize');
const { Donor, User } = require('../models');

/**
 * Blood compatibility map.
 * Key = donor blood group → Value = array of recipient groups they can donate to.
 * We invert this to find: "which donor groups can donate to the requested group?"
 */
const DONATE_TO_MAP = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'O+', 'AB+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

/**
 * Given a recipient's blood group, find all donor blood groups
 * that are compatible (i.e., can donate to the recipient).
 */
const getCompatibleDonorGroups = (recipientGroup) => {
  const compatible = [];
  for (const [donorGroup, canDonateTo] of Object.entries(DONATE_TO_MAP)) {
    if (canDonateTo.includes(recipientGroup)) {
      compatible.push(donorGroup);
    }
  }
  return compatible;
};

/**
 * POST /api/donors/profile
 * Create donor profile for logged-in user.
 */
const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if profile already exists
    const existing = await Donor.findOne({ where: { userId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Donor profile already exists. Use PUT to update.',
      });
    }

    // Get user details for defaults
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const { bloodGroup, city, isAvailable, lastDonated } = req.body;

    const donor = await Donor.create({
      userId,
      bloodGroup: bloodGroup || user.bloodGroup,
      city: city || user.city,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      lastDonated: lastDonated || null,
      totalDonations: 0,
    });

    return res.status(201).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    console.error('Create donor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PUT /api/donors/profile
 * Update donor profile for logged-in user.
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const donor = await Donor.findOne({ where: { userId } });
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found. Create one first.',
      });
    }

    const { bloodGroup, city, isAvailable, lastDonated, totalDonations } = req.body;

    if (bloodGroup !== undefined) donor.bloodGroup = bloodGroup;
    if (city !== undefined) donor.city = city;
    if (isAvailable !== undefined) donor.isAvailable = isAvailable;
    if (lastDonated !== undefined) donor.lastDonated = lastDonated;
    if (totalDonations !== undefined) donor.totalDonations = totalDonations;

    await donor.save();

    return res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    console.error('Update donor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/donors/availability
 * Toggle isAvailable for logged-in donor.
 */
const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const donor = await Donor.findOne({ where: { userId } });
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.',
      });
    }

    donor.isAvailable = !donor.isAvailable;
    await donor.save();

    return res.status(200).json({
      success: true,
      data: {
        isAvailable: donor.isAvailable,
      },
      message: `Availability set to ${donor.isAvailable ? 'available' : 'unavailable'}.`,
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/donors/search?bloodGroup=O+&city=Nagpur
 * Search available donors using blood compatibility logic.
 */
const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'bloodGroup query parameter is required.',
      });
    }

    // Find all donor blood groups that can donate to the requested group
    const compatibleGroups = getCompatibleDonorGroups(bloodGroup);

    if (compatibleGroups.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No compatible blood groups found.',
      });
    }

    // Build where clause
    const whereClause = {
      bloodGroup: { [Op.in]: compatibleGroups },
      isAvailable: true,
    };

    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }

    const donors = await Donor.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'city', 'bloodGroup'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    console.error('Search donors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  createProfile,
  updateProfile,
  toggleAvailability,
  searchDonors,
};
