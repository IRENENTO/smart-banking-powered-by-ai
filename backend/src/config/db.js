require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

function convertParams(sql, params) {
    if (!params || params.length === 0) return { sql, params: [] };
    let idx = 0;
    const paramMap = {};
    const convertedSql = sql.replace(/\$(\d+)/g, (match, num) => {
        if (!paramMap[num]) {
            paramMap[num] = ++idx;
        }
        return '?';
    });
    const ordered = params.map((_, i) => params[i]);
    return { sql: convertedSql, params: ordered };
}

async function query(sql, params) {
    const { sql: convertedSql, params: convertedParams } = convertParams(sql, params);
    const [rows, fields] = await pool.query(convertedSql, convertedParams);
    return {
        rows: rows,
        rowCount: rows.length
    };
}

const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ TiDB Cloud connected successfully (MySQL protocol with SSL)');
        return true;
    } catch (err) {
        console.error('❌ TiDB Cloud connection error:', err.message);
        return false;
    }
};

pool.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
});

module.exports = { pool, connectDB, query };
