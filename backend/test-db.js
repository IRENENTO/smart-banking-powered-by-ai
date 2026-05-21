const mysql = require('mysql2/promise');
require('dotenv').config();
async function test() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'irene2003',
        database: process.env.DB_NAME || 'smart_banking_powered_by_ai'
    });
    // Test the actual getUsers query
    try {
        const [users] = await c.execute('SELECT * FROM users WHERE 1=1 ORDER BY created_at DESC LIMIT 5 OFFSET 0');
        console.log('USERS RAW:', JSON.stringify(users));
    } catch(e) { console.error('getUsers ERROR:', e.message); }

    // Test getTransactions query
    try {
        const [tx] = await c.execute('SELECT * FROM transactions WHERE 1=1 ORDER BY created_at DESC LIMIT 5 OFFSET 0');
        console.log('TX COUNT:', tx.length, 'SAMPLE:', tx[0]?.reference_number);
    } catch(e) { console.error('getTransactions ERROR:', e.message); }

    // Test getLoans query
    try {
        const [loans] = await c.execute('SELECT l.*, u.email, u.name FROM loans l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 5 OFFSET 0');
        console.log('LOANS COUNT:', loans.length);
    } catch(e) { console.error('getLoans ERROR:', e.message); }

    // Test countQuery
    try {
        const [count] = await c.execute('SELECT COUNT(*) as total FROM users WHERE 1=1');
        console.log('USER COUNT:', count[0].total);
    } catch(e) { console.error('COUNT ERROR:', e.message); }

    // Check fraud alerts
    try {
        const [fa] = await c.execute('SELECT COUNT(*) as cnt FROM fraud_alerts');
        console.log('FRAUD ALERTS COUNT:', fa[0].cnt);
    } catch(e) { console.error('fraud_alerts ERROR:', e.message); }

    await c.end();
}
test().catch(e => console.error('ERROR:', e.message));
