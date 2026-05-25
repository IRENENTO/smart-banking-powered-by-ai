class MovementAnalyzer {
  constructor() {
    this.baselines = new Map();
  }

  analyze(deviceId, sensorEvents) {
    const events = Array.isArray(sensorEvents) ? sensorEvents : [sensorEvents];

    let riskScore = 0;
    let reason = null;

    const suddenMovements = events.filter(e => e.eventType === 'sudden_movement');
    const shakes = events.filter(e => e.eventType === 'shake');
    const rotations = events.filter(e => e.eventType === 'rotation');

    if (suddenMovements.length >= 3 && shakes.length >= 1) {
      riskScore = Math.min(riskScore + 40, 100);
      reason = 'Multiple sudden movements detected with shaking - possible snatch attempt';
    }

    if (suddenMovements.length > 0 && rotations.length > 0) {
      riskScore = Math.min(riskScore + 25, 100);
      reason = reason || 'Sudden movement with rotation - suspicious handling';
    }

    if (suddenMovements.length >= 5) {
      riskScore = Math.min(riskScore + 30, 100);
      reason = 'Abnormal movement frequency detected';
    }

    return {
      riskScore,
      confidence: riskScore > 0 ? Math.min(0.9, 0.5 + riskScore / 200) : 0,
      reason,
      triggeredAction: riskScore > 70 ? 'capture_photo' : riskScore > 40 ? 'monitor' : null,
    };
  }
}

module.exports = new MovementAnalyzer();
