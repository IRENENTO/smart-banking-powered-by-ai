const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiAnalysis = sequelize.define('AiAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  analysisType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  riskScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: '0-100 risk score',
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '0-1 confidence level',
  },
  patternData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  triggeredAction: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  analyzedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'ai_analyses',
  indexes: [
    {
      name: 'idx_ai_device_type_score',
      fields: ['device_id', 'analysis_type', 'risk_score'],
    },
  ],
});

module.exports = AiAnalysis;
