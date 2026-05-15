require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is required');
    process.exit(1);
}

module.exports = {
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET,
    AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
    PAYPACK_CLIENT_ID: process.env.PAYPACK_CLIENT_ID,
    PAYPACK_CLIENT_SECRET: process.env.PAYPACK_CLIENT_SECRET,
    PAYPACK_BASE_URL: process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};
