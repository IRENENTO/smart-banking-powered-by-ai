require('dotenv').config();
const mysql = require('mysql2/promise');

const dbName = process.env.TIDB_DB_NAME || process.env.DB_NAME;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false // Set to true if you have the CA certificate
    },
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

function convertParams(sql, params) {
    if (!params || params.length === 0) return { sql, params: [] };
    
    // If SQL already has MySQL placeholders (?), don't try to convert
    if (sql.includes('?') && !sql.includes('$1')) {
        return { sql, params };
    }

    let idx = 0;
    const paramMap = {};
    const convertedSql = sql.replace(/\$(\d+)/g, (match, num) => {
        if (!paramMap[num]) {
            paramMap[num] = ++idx;
        }
        return '?';
    });
    return { sql: convertedSql, params: params };
}

async function query(sql, params) {
    const { sql: convertedSql, params: convertedParams } = convertParams(sql, params);
    const mysqlSql = convertedSql.replace(/\s+RETURNING\s+\S+/gi, '');
    
    try {
        const [rows] = await pool.query(mysqlSql, convertedParams);
        if (rows && typeof rows === 'object' && 'insertId' in rows) {
            return {
                rows: rows.insertId ? [{ id: rows.insertId }] : [],
                rowCount: rows.affectedRows || 0,
                insertId: rows.insertId
            };
        }
        return {
            rows: Array.isArray(rows) ? rows : [rows],
            rowCount: Array.isArray(rows) ? rows.length : (rows ? 1 : 0)
        };
    } catch (err) {
        if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('🔄 Database connection reset, retrying query...');
            const [rows] = await pool.query(mysqlSql, convertedParams);
            return {
                rows: Array.isArray(rows) ? rows : [rows],
                rowCount: Array.isArray(rows) ? rows.length : 1
            };
        }
        throw err;
    }
}

const connectDB = async (retries = 5) => {
    while (retries > 0) {
        try {
            const connection = await pool.getConnection();
            await connection.query('SELECT 1');
            connection.release();
            global.dbConnection = pool;
            console.log('✅ TiDB Cloud connected successfully (MySQL protocol with SSL)');
            return true;
        } catch (err) {
            retries -= 1;
            console.error(`❌ TiDB Cloud connection error (${err.code}): ${err.message}`);
            if (retries === 0) return false;
            console.log(`Retrying connection... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};

pool.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
});

module.exports = { pool, connectDB, query };
