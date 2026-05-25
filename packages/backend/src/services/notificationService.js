let admin = null;

try {
  admin = require('firebase-admin');
} catch (e) {}

class NotificationService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    const config = require('../config');
    if (config.firebase.projectId && admin) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
            clientEmail: config.firebase.clientEmail,
          }),
        });
        this.initialized = true;
        console.log('Firebase notifications initialized');
      } catch (e) {
        console.warn('Firebase init failed:', e.message);
      }
    }
  }

  async sendPushNotification(fcmToken, title, body, data = {}) {
    if (!this.initialized || !fcmToken) {
      console.log('Push not sent (uninitialized or no token):', title);
      return;
    }

    try {
      const message = {
        token: fcmToken,
        notification: { title, body },
        data: { ...data, timestamp: Date.now().toString() },
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      };

      await admin.messaging().send(message);
    } catch (e) {
      console.error('Push notification error:', e.message);
    }
  }

  async sendAlertNotification(device, alert) {
    if (!device.fcmToken) return;

    const titles = {
      suspicious_movement: '⚠️ Suspicious Movement Detected',
      unusual_location: '📍 Unusual Location Detected',
      failed_unlock: '🔐 Failed Unlock Attempt',
      sim_change: '📱 SIM Card Change Detected',
      unauthorized_shutdown: '🔌 Unauthorized Shutdown Attempt',
      snatch_detected: '🚨 Phone Snatch Detected',
      sos_emergency: '🆘 SOS Emergency Alert',
      intruder_captured: '📸 Intruder Photo Captured',
    };

    const title = titles[alert.type] || 'Security Alert';
    await this.sendPushNotification(device.fcmToken, title, alert.description, {
      type: 'alert',
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
    });
  }
}

module.exports = new NotificationService();
