const mysql = require('mysql2/promise');
async function test() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'test'
        });
    } catch (err) {
        console.log('Error type:', typeof err);
        console.log('Error message:', err.message);
        console.log('Error code:', err.code);
        console.log('Full error:', err);
    }
}
test();
