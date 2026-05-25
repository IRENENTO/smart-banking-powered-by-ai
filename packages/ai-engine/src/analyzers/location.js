class LocationAnalyzer {
  constructor() {
    this.locationHistory = new Map();
  }

  analyze(deviceId, newLocation, history = []) {
    let riskScore = 0;
    let reason = null;

    const allLocations = [...history, newLocation].filter(Boolean).slice(-50);

    if (allLocations.length < 2) {
      return { riskScore: 0, confidence: 0, reason: 'Insufficient data', triggeredAction: null };
    }

    const speeds = [];
    for (let i = 0; i < allLocations.length - 1; i++) {
      const distance = this.haversineDistance(
        allLocations[i].latitude, allLocations[i].longitude,
        allLocations[i + 1].latitude, allLocations[i + 1].longitude
      );
      const timeDiff = (new Date(allLocations[i + 1].recordedAt) - new Date(allLocations[i].recordedAt)) / 1000;
      if (timeDiff > 0) {
        speeds.push((distance / timeDiff) * 3.6);
      }
    }

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

    if (avgSpeed > 120) {
      riskScore = Math.min(riskScore + 60, 100);
      reason = 'Device moving at high speed - possible theft with vehicle';
    } else if (avgSpeed > 60) {
      riskScore = Math.min(riskScore + 30, 100);
      reason = 'Unusually high movement speed detected';
    }

    if (speeds.length > 0) {
      const maxSpeed = Math.max(...speeds);
      const speedSpikeThreshold = 80;
      if (maxSpeed > speedSpikeThreshold) {
        riskScore = Math.min(riskScore + 25, 100);
        reason = reason || 'Sudden speed spike detected';
      }
    }

    return {
      riskScore,
      confidence: riskScore > 0 ? Math.min(0.85, 0.4 + riskScore / 200) : 0,
      reason,
      triggeredAction: riskScore > 50 ? 'alert' : null,
    };
  }

  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

module.exports = new LocationAnalyzer();
