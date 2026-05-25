const { Location, Alert, Device } = require('../models');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

const onlineDevices = new Map();

const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config');
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.userId });

    socket.on('location:update', async (data) => {
      try {
        const { deviceId, latitude, longitude, accuracy, speed, altitude, bearing, batteryLevel, networkType, timestamp } = data;

        const location = await Location.create({
          deviceId,
          latitude,
          longitude,
          accuracy,
          speed,
          altitude,
          bearing,
          batteryLevel,
          networkType,
          recordedAt: timestamp || new Date(),
        });

        await Device.update(
          { lastSeen: new Date(), batteryLevel, isOnline: true },
          { where: { id: deviceId } }
        );

        socket.to(`device:${deviceId}`).emit('location:broadcast', {
          deviceId,
          latitude,
          longitude,
          speed,
          batteryLevel,
          timestamp: location.recordedAt,
        });

        io.to(`admin:dashboard`).emit('location:broadcast', {
          deviceId,
          latitude,
          longitude,
          speed,
          timestamp: location.recordedAt,
        });
      } catch (err) {
        logger.error('Location update error', err);
      }
    });

    socket.on('alert:trigger', async (data) => {
      try {
        const { deviceId, type, severity, title, description, latitude, longitude, metadata } = data;

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

        io.to(`device:${deviceId}`).emit('alert:new', alert);

        io.to(`admin:dashboard`).emit('alert:new', alert);

        const device = await Device.findByPk(deviceId);
        if (device) {
          await notificationService.sendAlertNotification(device, alert);
        }
      } catch (err) {
        logger.error('Alert trigger error', err);
      }
    });

    socket.on('tracking:subscribe', ({ deviceId }) => {
      socket.join(`device:${deviceId}`);
      socket.join(`user:${socket.userId}`);
      onlineDevices.set(deviceId, { socketId: socket.id, userId: socket.userId });
      logger.info('Tracking subscribed', { deviceId, userId: socket.userId });
    });

    socket.on('admin:subscribe', () => {
      socket.join(`admin:dashboard`);
    });

    socket.on('device:online', async ({ deviceId }) => {
      await Device.update({ isOnline: true, lastSeen: new Date() }, { where: { id: deviceId } });
      socket.join(`device:${deviceId}`);
    });

    socket.on('device:offline', async ({ deviceId }) => {
      await Device.update({ isOnline: false }, { where: { id: deviceId } });
      io.to(`admin:dashboard`).emit('device:status-changed', { deviceId, isOnline: false });
    });

    socket.on('disconnect', async () => {
      logger.info('Socket disconnected', { socketId: socket.id });
      for (const [deviceId, info] of onlineDevices.entries()) {
        if (info.socketId === socket.id) {
          onlineDevices.delete(deviceId);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = { setupSocketHandlers, onlineDevices };
