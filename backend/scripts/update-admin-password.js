// Run with: node scripts/update-admin-password.js
// Updates the admin password to "irene12003"

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 4000,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'irene2003',
        database: process.env.DB_NAME || 'smart_banking_powered_by_ai',
        ssl: { rejectUnauthorized: false }
    });

    const email = 'smartbankingpoweredbyai@gmail.com';
    const password = 'irene12003';
    const hash = await bcrypt.hash(password, 10);

    await connection.execute(
        `INSERT INTO admins (email, password_hash, name, role, status)
         VALUES (?, ?, 'Admin User', 'super_admin', 'active')
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), role = VALUES(role), status = VALUES(status)`,
        [email, hash]
    );

    console.log(`Admin updated: ${email} / ${password}`);
    await connection.end();
}

main().catch(console.error);
