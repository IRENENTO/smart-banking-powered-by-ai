class UnlockPatternAnalyzer {
  analyze(deviceId, attempts) {
    if (!attempts || attempts.length === 0) {
      return { riskScore: 0, confidence: 0, reason: null, triggeredAction: null };
    }

    const recentAttempts = attempts.slice(-20);
    const failed = recentAttempts.filter(a => !a.success);
    const failedCount = failed.length;
    const totalCount = recentAttempts.length;

    let riskScore = 0;
    let reason = null;

    if (failedCount >= 10) {
      riskScore = Math.min(riskScore + 90, 100);
      reason = 'Critical: 10+ failed unlock attempts - possible brute force attack';
    } else if (failedCount >= 5) {
      riskScore = Math.min(riskScore + 65, 100);
      reason = 'High: 5+ failed unlock attempts detected';
    } else if (failedCount >= 3) {
      riskScore = Math.min(riskScore + 40, 100);
      reason = 'Medium: Multiple failed unlock attempts';
    }

    if (totalCount > 0) {
      const failureRate = (failedCount / totalCount) * 100;
      if (failureRate > 80 && totalCount >= 5) {
        riskScore = Math.min(riskScore + 20, 100);
        reason = reason || 'High failure rate - unauthorized access attempt';
      }
    }

    const timeWindow = 5 * 60 * 1000;
    const recentInWindow = recentAttempts.filter(
      a => !a.success && (new Date(a.attemptedAt).getTime() > Date.now() - timeWindow)
    );

    if (recentInWindow.length >= 3) {
      riskScore = Math.min(riskScore + 15, 100);
    }

    return {
      riskScore,
      confidence: riskScore > 0 ? Math.min(0.95, 0.3 + riskScore / 150) : 0,
      reason,
      triggeredAction: riskScore >= 65 ? 'capture_photo' : riskScore >= 40 ? 'alert' : null,
    };
  }
}

module.exports = new UnlockPatternAnalyzer();
