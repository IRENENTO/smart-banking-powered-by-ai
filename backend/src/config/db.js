const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smart_banking_powered_by_ai',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    return pool;
}

const query = async (sql, params = []) => {
    const convertedSql = pgToMySql(sql);
    const sanitized = params.map(p => p === undefined ? null : p);
    const [rows] = await getPool().query(convertedSql, sanitized);
    if (Array.isArray(rows)) {
        return { rows, rowCount: rows.length };
    }
    return { rows: [{ id: rows.insertId || 0 }], rowCount: rows.affectedRows || 0 };
};

function pgToMySql(sql) {
    let result = sql.replace(/\$(\d+)/g, '?');
    result = result.replace(/\s+RETURNING\s+.+?(?=\s*(?:;|\s*$))/i, '');
    result = result.replace(/::\w+/g, '');
    return result;
}

const compat = {
    async execute(sql, params = []) {
        const convertedSql = pgToMySql(sql);
        const sanitized = params.map(p => p === undefined ? null : p);
        const [rows, fields] = await getPool().query(convertedSql, sanitized);
        const trimmed = sql.trimStart().toUpperCase();
        if (trimmed.startsWith('INSERT')) {
            return [{
                insertId: rows.insertId || 0,
                affectedRows: rows.affectedRows || 0,
            }, []];
        } else if (trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
            return [{ affectedRows: rows.affectedRows || 0 }, []];
        } else {
            return [rows, fields || []];
        }
    },
    async query(sql, params = []) {
        return this.execute(sql, params);
    },
};

const connectDB = async () => {
    try {
        await getPool().execute('SELECT 1');
        global.dbConnection = compat;
        console.log('MySQL connected successfully');
    } catch (err) {
        console.error('Database connection error:', err.message || err);
        console.warn('Server will continue without database — only static and docs routes will work');
    }
};

module.exports = { query, connectDB, compat };
