const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env' });

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'irene2003',
            database: process.env.DB_NAME || 'smart_banking_powered_by_ai',
            multipleStatements: true
        });

        console.log('Connected to MySQL.');

        // Run admin tables migration first (creates admins table + seed admin)
        const sql1 = fs.readFileSync(path.join(__dirname, 'migrations', '001_create_admin_tables.sql'), 'utf8');
        await connection.query(sql1);
        console.log('Admin tables migration executed.');

        const sql2 = fs.readFileSync(path.join(__dirname, 'src', 'migrations', '02_missing_tables.sql'), 'utf8');
        await connection.query(sql2);
        console.log('Missing tables migration executed.');

        const sql3 = fs.readFileSync(path.join(__dirname, 'src', 'migrations', 'investments.sql'), 'utf8');
        await connection.query(sql3);
        console.log('Investments migration executed.');

        const sql4 = fs.readFileSync(path.join(__dirname, 'migrations', '002_create_cms_tables.sql'), 'utf8');
        await connection.query(sql4);
        console.log('CMS tables migration executed.');

        await connection.end();
        console.log('Done.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
