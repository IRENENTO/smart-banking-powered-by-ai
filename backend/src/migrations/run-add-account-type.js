const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_banking_powered_by_ai',
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
    });

    try {
        console.log('Adding account_type column to accounts table...');
        await pool.execute(
            `ALTER TABLE accounts ADD COLUMN account_type VARCHAR(50) DEFAULT 'savings' AFTER currency`
        );
        console.log('Column added successfully.');
    } catch (err) {
        if (err.errno === 1060) {
            console.log('Column account_type already exists. Skipping.');
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        await pool.end();
    }
}

run();
