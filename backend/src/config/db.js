const mysql = require('mysql2/promise');

const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = 'irene2003',
    DB_NAME = 'smart_banking_powered_by_ai'
} = process.env;

const connectDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log(`MySQL Connected to ${DB_NAME}...`);

        global.dbConnection = connection;

        await connection.execute('SELECT 1');
        console.log('Database connection verified');

        return connection;
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
