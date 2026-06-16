require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is required');
    process.exit(1);
}

module.exports = {
    PORT: process.env.PORT || 4000,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000/api/ai',
    AI_ENGINE_API_KEY: process.env.AI_ENGINE_API_KEY || 'dev-key-change-in-production',
    PAYPACK_CLIENT_ID: process.env.PAYPACK_CLIENT_ID,
    PAYPACK_CLIENT_SECRET: process.env.PAYPACK_CLIENT_SECRET,
    PAYPACK_BASE_URL: process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
