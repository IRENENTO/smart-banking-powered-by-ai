class SimDetector {
  analyze(deviceId, events) {
    if (!events || events.length === 0) {
      return { riskScore: 0, confidence: 0, reason: null, triggeredAction: null };
    }

    const simRemoved = events.filter(e => e.eventType === 'sim_removed');
    const simChanged = events.filter(e => e.eventType === 'sim_changed');

    if (simRemoved.length > 0 || simChanged.length > 0) {
      const riskScore = simRemoved.length > 0 ? 95 : 85;

      return {
        riskScore,
        confidence: 0.9,
        reason: simRemoved.length > 0
          ? 'CRITICAL: SIM card removed - possible theft'
          : 'HIGH: SIM card changed - device may be compromised',
        triggeredAction: riskScore >= 80 ? 'full_lockdown' : 'alert',
      };
    }

    return { riskScore: 0, confidence: 0, reason: null, triggeredAction: null };
  }
}

module.exports = new SimDetector();
