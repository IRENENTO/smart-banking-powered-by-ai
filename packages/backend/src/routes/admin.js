const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { User, Device, Alert, Location, AiAnalysis } = require('../models');
const { success, paginated, error } = require('../utils/response');
const { Op, fn, col, literal } = require('sequelize');

router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt', 'mfaSecret', 'biometricPublicKey', 'refreshToken'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, 'Failed to fetch users', 500);
  }
});

router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    user.isActive = !user.isActive;
    await user.save();

    return success(res, { user: user.toSafeJSON() }, 'User status toggled');
  } catch (err) {
    return error(res, 'Failed to toggle user status', 500);
  }
});

router.get('/devices', async (req, res) => {
  try {
    const { page = 1, limit = 20, isOnline } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (isOnline !== undefined) where.isOnline = isOnline === 'true';

    const { rows, count } = await Device.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Location,
          limit: 1,
          order: [['recorded_at', 'DESC']],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_seen', 'DESC']],
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, 'Failed to fetch devices', 500);
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, resolved } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.isResolved = resolved === 'true';

    const { rows, count } = await Alert.findAndCountAll({
      where: { ...where, severity: ['high', 'critical'] },
      include: [{ model: Device, attributes: ['id', 'deviceName', 'deviceModel'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['triggered_at', 'DESC']],
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, 'Failed to fetch alerts', 500);
  }
});

router.get('/analytics/overview', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeDevices = await Device.count({ where: { isOnline: true } });
    const totalDevices = await Device.count();
    const totalAlerts = await Alert.count();
    const criticalAlerts = await Alert.count({ where: { severity: 'critical', isResolved: false } });

    const todayAlerts = await Alert.count({
      where: { triggeredAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });

    return success(res, {
      totalUsers,
      activeDevices,
      totalDevices,
      totalAlerts,
      criticalAlerts,
      todayAlerts,
    });
  } catch (err) {
    return error(res, 'Failed to fetch analytics', 500);
  }
});

router.get('/analytics/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const alerts = await Alert.findAll({
      attributes: [
        [fn('DATE', col('triggered_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        triggeredAt: { [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      },
      group: [fn('DATE', col('triggered_at'))],
      order: [[fn('DATE', col('triggered_at')), 'ASC']],
    });

    const alertTypes = await Alert.findAll({
      attributes: ['type', [fn('COUNT', col('id')), 'count']],
      group: ['type'],
    });

    return success(res, { trends: alerts, alertTypes });
  } catch (err) {
    return error(res, 'Failed to fetch trends', 500);
  }
});

module.exports = router;
