require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_banking',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
    AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
    PAYPACK_CLIENT_ID: process.env.PAYPACK_CLIENT_ID,
    PAYPACK_CLIENT_SECRET: process.env.PAYPACK_CLIENT_SECRET,
    PAYPACK_BASE_URL: process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api'
};
