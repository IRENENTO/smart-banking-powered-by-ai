const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Alert } = require('../models');
const { success, paginated, error } = require('../utils/response');
const { Op } = require('sequelize');

router.get('/device/:deviceId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, type, resolved } = req.query;
    const offset = (page - 1) * limit;

    const where = { deviceId: req.params.deviceId };
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (resolved !== undefined) where.isResolved = resolved === 'true';

    const { rows, count } = await Alert.findAndCountAll({
      where,
      order: [['triggered_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, 'Failed to fetch alerts', 500);
  }
});

router.put('/:id/resolve', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return error(res, 'Alert not found', 404);

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    await alert.save();

    return success(res, { alert }, 'Alert resolved');
  } catch (err) {
    return error(res, 'Failed to resolve alert', 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const { deviceId, type, severity, title, description, latitude, longitude, metadata } = req.body;

    const alert = await Alert.create({
      deviceId,
      type,
      severity: severity || 'medium',
      title,
      description,
      latitude,
      longitude,
      metadata,
      triggeredAt: new Date(),
    });

    return success(res, { alert }, 'Alert created', 201);
  } catch (err) {
    return error(res, 'Failed to create alert', 500);
  }
});

module.exports = router;
