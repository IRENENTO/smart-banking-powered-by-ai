const mongoose = require('mongoose');

const AIDecisionSchema = new mongoose.Schema({
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    riskScore: { type: Number, required: true },
    decision: { type: String, enum: ['APPROVED', 'REVIEW', 'REJECTED'], required: true },
    explanation: { type: String },
    forecastingMetrics: { type: Object },
    processedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIDecision', AIDecisionSchema);
