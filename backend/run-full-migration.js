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
            database: process.env.DB_NAME || 'ai_banking',
            multipleStatements: true
        });

        console.log('Connected to MySQL.');

        const sql1 = fs.readFileSync(path.join(__dirname, 'src', 'migrations', 'mysql-migration.sql'), 'utf8');
        await connection.query(sql1);
        console.log('Core migration executed.');

        const sql2 = fs.readFileSync(path.join(__dirname, 'src', 'migrations', 'settings.sql'), 'utf8');
        await connection.query(sql2);
        console.log('Settings tables migration executed.');

        await connection.end();
        console.log('Done.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
