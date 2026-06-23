const mysql = require('mysql2/promise');

const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = 'irene2003',
    DB_NAME = 'smart_banking_powered_by_ai'
} = process.env;

const run = async () => {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    });

    try {
        await connection.execute(
            `ALTER TABLE accounts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`
        );
        console.log('+ Added column: accounts.updated_at');
    } catch (err) {
        if (err.message.includes('Duplicate column')) {
            console.log('  Column already exists: accounts.updated_at');
        } else {
            console.error('  Error adding accounts.updated_at:', err.message);
        }
    }

    console.log('Migration complete.');
    await connection.end();
};

run().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
