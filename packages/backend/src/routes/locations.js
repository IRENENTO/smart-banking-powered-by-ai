const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Device, Location } = require('../models');
const { success, paginated, error } = require('../utils/response');
const { Op } = require('sequelize');

router.get('/:deviceId', authenticate, async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.deviceId, userId: req.userId },
    });
    if (!device) return error(res, 'Device not found', 404);

    const { from, to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = { deviceId: req.params.deviceId };
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt[Op.gte] = new Date(from);
      if (to) where.recordedAt[Op.lte] = new Date(to);
    }

    const { rows, count } = await Location.findAndCountAll({
      where,
      order: [['recorded_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, 'Failed to fetch locations', 500);
  }
});

router.get('/:deviceId/latest', authenticate, async (req, res) => {
  try {
    const location = await Location.findOne({
      where: { deviceId: req.params.deviceId },
      order: [['recorded_at', 'DESC']],
    });

    if (!location) return error(res, 'No location data', 404);
    return success(res, { location });
  } catch (err) {
    return error(res, 'Failed to fetch location', 500);
  }
});

router.get('/:deviceId/path', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { deviceId: req.params.deviceId };

    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt[Op.gte] = new Date(from);
      if (to) where.recordedAt[Op.lte] = new Date(to);
    }

    const locations = await Location.findAll({
      where,
      order: [['recorded_at', 'ASC']],
      limit: 500,
      attributes: ['latitude', 'longitude', 'speed', 'recorded_at'],
    });

    return success(res, { path: locations });
  } catch (err) {
    return error(res, 'Failed to fetch path', 500);
  }
});

module.exports = router;
