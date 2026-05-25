const MovementAnalyzer = require('./analyzers/movement');
const LocationAnalyzer = require('./analyzers/location');
const UnlockPatternAnalyzer = require('./analyzers/unlockPattern');
const SimDetector = require('./analyzers/simDetector');

class AIEngine {
  constructor() {
    this.analyzers = {
      movement: MovementAnalyzer,
      location: LocationAnalyzer,
      unlockPattern: UnlockPatternAnalyzer,
      simDetector: SimDetector,
    };
  }

  analyze(deviceId, analysisType, data) {
    const analyzer = this.analyzers[analysisType];
    if (!analyzer) {
      throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    return analyzer.analyze(deviceId, data);
  }

  async comprehensiveAnalysis(deviceId, context) {
    const results = [];

    if (context.sensorEvents) {
      const movementResult = this.analyze(deviceId, 'movement', context.sensorEvents);
      results.push({ ...movementResult, analysisType: 'movement' });
    }

    if (context.location) {
      const locationResult = this.analyze(deviceId, 'location', context.location);
      results.push({ ...locationResult, analysisType: 'location' });
    }

    if (context.unlockAttempts) {
      const unlockResult = this.analyze(deviceId, 'unlockPattern', context.unlockAttempts);
      results.push({ ...unlockResult, analysisType: 'unlockPattern' });
    }

    if (context.sensorEvents) {
      const simResult = this.analyze(deviceId, 'simDetector', context.sensorEvents);
      results.push({ ...simResult, analysisType: 'simDetector' });
    }

    const overallRiskScore = Math.min(
      100,
      results.reduce((sum, r) => sum + (r.riskScore || 0), 0)
    );

    const criticalResults = results.filter(r => r.riskScore >= 70);
    const highResults = results.filter(r => r.riskScore >= 40 && r.riskScore < 70);

    let overallAction = null;
    let overallReason = null;

    if (criticalResults.length > 0) {
      overallAction = criticalResults[0].triggeredAction;
      overallReason = criticalResults[0].reason;
    } else if (highResults.length > 0) {
      overallAction = highResults[0].triggeredAction;
      overallReason = highResults[0].reason;
    }

    return {
      deviceId,
      overallRiskScore,
      confidence: results.length > 0
        ? results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
        : 0,
      reason: overallReason,
      triggeredAction: overallAction,
      analyses: results,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AIEngine();
