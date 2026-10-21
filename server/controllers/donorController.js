const { Op } = require('sequelize');
const { Donor, User, sequelize } = require('../models');

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

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
 * Pure Haversine formula calculation in kilometers.
 * Useful for unit testing and offline calculation.
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * GET /api/donors/profile
 * Get donor profile for logged-in user (including saved coordinates).
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const donor = await Donor.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'city', 'bloodGroup'],
        },
      ],
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found. Create one first.',
      });
    }

    return res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    console.error('Get donor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
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

    const { bloodGroup, city, isAvailable, lastDonated, latitude, longitude } = req.body;

    let parsedLat = null;
    let parsedLng = null;

    if (latitude !== undefined && latitude !== null && String(latitude).trim() !== '') {
      parsedLat = parseFloat(latitude);
      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude. Must be a number between -90 and 90.',
        });
      }
    }

    if (longitude !== undefined && longitude !== null && String(longitude).trim() !== '') {
      parsedLng = parseFloat(longitude);
      if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude. Must be a number between -180 and 180.',
        });
      }
    }

    // Both coordinates must be provided if either is set
    if ((parsedLat !== null && parsedLng === null) || (parsedLat === null && parsedLng !== null)) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude and longitude are required when setting location.',
      });
    }

    const donor = await Donor.create({
      userId,
      bloodGroup: bloodGroup || user.bloodGroup,
      city: city || user.city,
      latitude: parsedLat,
      longitude: parsedLng,
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

    const { bloodGroup, city, isAvailable, lastDonated, totalDonations, latitude, longitude } = req.body;

    if (bloodGroup !== undefined) donor.bloodGroup = bloodGroup;
    if (city !== undefined) donor.city = city;
    if (isAvailable !== undefined) donor.isAvailable = isAvailable;
    if (lastDonated !== undefined) donor.lastDonated = lastDonated;
    if (totalDonations !== undefined) donor.totalDonations = totalDonations;

    // Handle latitude & longitude updates
    if (latitude !== undefined || longitude !== undefined) {
      let parsedLat = donor.latitude;
      let parsedLng = donor.longitude;

      if (latitude !== undefined) {
        if (latitude === null || String(latitude).trim() === '') {
          parsedLat = null;
        } else {
          parsedLat = parseFloat(latitude);
          if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
            return res.status(400).json({
              success: false,
              message: 'Invalid latitude. Must be a number between -90 and 90.',
            });
          }
        }
      }

      if (longitude !== undefined) {
        if (longitude === null || String(longitude).trim() === '') {
          parsedLng = null;
        } else {
          parsedLng = parseFloat(longitude);
          if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
            return res.status(400).json({
              success: false,
              message: 'Invalid longitude. Must be a number between -180 and 180.',
            });
          }
        }
      }

      // Ensure both are set or both are cleared
      if ((parsedLat !== null && parsedLng === null) || (parsedLat === null && parsedLng !== null)) {
        return res.status(400).json({
          success: false,
          message: 'Both latitude and longitude must be provided, or both cleared.',
        });
      }

      donor.latitude = parsedLat;
      donor.longitude = parsedLng;
    }

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
 * GET /api/donors/search?bloodGroup=O+&latitude=21.1458&longitude=79.0882&radius=10&city=Nagpur
 * Search available donors using blood compatibility logic and optional Haversine distance radius.
 */
const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, city, latitude, longitude, radius } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'bloodGroup query parameter is required.',
      });
    }

    const trimmedBloodGroup = bloodGroup.trim().toUpperCase();
    if (!VALID_BLOOD_GROUPS.includes(trimmedBloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`,
      });
    }

    // Find all donor blood groups that can donate to the requested group
    const compatibleGroups = getCompatibleDonorGroups(trimmedBloodGroup);

    if (compatibleGroups.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No compatible blood groups found.',
      });
    }

    const hasLat = latitude !== undefined && latitude !== null && String(latitude).trim() !== '';
    const hasLng = longitude !== undefined && longitude !== null && String(longitude).trim() !== '';

    // If either coordinate is passed, both are required
    if (hasLat || hasLng) {
      if (!hasLat || !hasLng) {
        return res.status(400).json({
          success: false,
          message: 'Both latitude and longitude are required for location-based search.',
        });
      }

      const searchLat = parseFloat(latitude);
      const searchLng = parseFloat(longitude);

      if (isNaN(searchLat) || searchLat < -90 || searchLat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude. Must be a number between -90 and 90.',
        });
      }

      if (isNaN(searchLng) || searchLng < -180 || searchLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude. Must be a number between -180 and 180.',
        });
      }

      let radiusKm = 10; // Default to 10 km
      if (radius !== undefined && radius !== null && String(radius).trim() !== '') {
        radiusKm = parseFloat(radius);
        if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
          return res.status(400).json({
            success: false,
            message: 'Invalid radius. Must be a positive number up to 500 km.',
          });
        }
      }

      // Safe Haversine formula in MySQL (clamped with LEAST and GREATEST to avoid ACOS domain errors)
      const haversineFormula = `(6371 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(${searchLat})) * COS(RADIANS(\`Donor\`.\`latitude\`)) *
          COS(RADIANS(\`Donor\`.\`longitude\`) - RADIANS(${searchLng})) +
          SIN(RADIANS(${searchLat})) * SIN(RADIANS(\`Donor\`.\`latitude\`))
        ))
      ))`;

      const whereClause = {
        bloodGroup: { [Op.in]: compatibleGroups },
        isAvailable: true,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        [Op.and]: [
          sequelize.where(sequelize.literal(haversineFormula), '<=', radiusKm),
        ],
      };

      if (city && city.trim()) {
        whereClause.city = { [Op.like]: `%${city.trim()}%` };
      }

      const donors = await Donor.findAll({
        where: whereClause,
        attributes: {
          include: [
            [sequelize.literal(`ROUND(${haversineFormula}, 1)`), 'distanceKm'],
          ],
          exclude: ['latitude', 'longitude'], // Strict privacy: Never expose exact coordinates publicly
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'city', 'bloodGroup'],
          },
        ],
        order: [
          [sequelize.literal(haversineFormula), 'ASC'], // Nearest first
        ],
      });

      // Format distanceKm as pure number and sanitize
      const sanitizedDonors = donors.map((d) => {
        const item = d.toJSON();
        delete item.latitude;
        delete item.longitude;
        if (item.distanceKm !== undefined && item.distanceKm !== null) {
          item.distanceKm = parseFloat(item.distanceKm);
        }
        return item;
      });

      return res.status(200).json({
        success: true,
        count: sanitizedDonors.length,
        radiusKm,
        data: sanitizedDonors,
      });
    }

    // Standard search without location coordinates (preserves backward compatibility)
    const whereClause = {
      bloodGroup: { [Op.in]: compatibleGroups },
      isAvailable: true,
    };

    if (city && city.trim()) {
      whereClause.city = { [Op.like]: `%${city.trim()}%` };
    }

    const donors = await Donor.findAll({
      where: whereClause,
      attributes: {
        exclude: ['latitude', 'longitude'], // Privacy: Never expose coordinates
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'city', 'bloodGroup'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const sanitizedDonors = donors.map((d) => {
      const item = d.toJSON();
      delete item.latitude;
      delete item.longitude;
      return item;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedDonors.length,
      data: sanitizedDonors,
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
  getProfile,
  createProfile,
  updateProfile,
  toggleAvailability,
  searchDonors,
  calculateHaversineDistance,
  getCompatibleDonorGroups,
};
