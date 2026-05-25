const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Device, Location, Alert } = require('../models');
const { success, error } = require('../utils/response');

router.post('/register', authenticate, async (req, res) => {
  try {
    const { deviceId, deviceName, deviceModel, osVersion, fcmToken } = req.body;

    const existing = await Device.findOne({ where: { deviceId } });
    if (existing) {
      existing.userId = req.userId;
      existing.fcmToken = fcmToken || existing.fcmToken;
      existing.isOnline = true;
      existing.lastSeen = new Date();
      await existing.save();
      return success(res, { device: existing }, 'Device re-registered');
    }

    const device = await Device.create({
      userId: req.userId,
      deviceId,
      deviceName,
      deviceModel,
      osVersion,
      fcmToken,
      isOnline: true,
      lastSeen: new Date(),
    });

    return success(res, { device }, 'Device registered', 201);
  } catch (err) {
    return error(res, 'Device registration failed', 500);
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Location,
          limit: 1,
          order: [['recorded_at', 'DESC']],
          attributes: ['latitude', 'longitude', 'recorded_at', 'battery_level'],
        },
      ],
    });
    return success(res, { devices });
  } catch (err) {
    return error(res, 'Failed to fetch devices', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [
        {
          model: Alert,
          limit: 10,
          order: [['triggered_at', 'DESC']],
        },
      ],
    });

    if (!device) return error(res, 'Device not found', 404);
    return success(res, { device });
  } catch (err) {
    return error(res, 'Failed to fetch device', 500);
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!device) return error(res, 'Device not found', 404);

    const allowed = ['deviceName', 'stealthMode', 'stealthIconName', 'secretDialCode', 'settings'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        device[field] = req.body[field];
      }
    });

    await device.save();
    return success(res, { device }, 'Device updated');
  } catch (err) {
    return error(res, 'Failed to update device', 500);
  }
});

router.post('/:id/command', authenticate, async (req, res) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!device) return error(res, 'Device not found', 404);

    const { command } = req.body;
    const validCommands = ['lock', 'unlock', 'alarm_on', 'alarm_off', 'track', 'capture_photo', 'enable_stealth', 'disable_stealth', 'wipe'];

    if (!validCommands.includes(command)) {
      return error(res, 'Invalid command', 400);
    }

    // In production, this would emit via Socket.IO to the device
    const { DeviceCommand } = require('../models');
    await DeviceCommand.create({
      deviceId: device.id,
      commandType: command,
      status: 'pending',
      issuedAt: new Date(),
    });

    return success(res, { command }, 'Command sent to device');
  } catch (err) {
    return error(res, 'Failed to send command', 500);
  }
});

module.exports = router;
