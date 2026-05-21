const mysql = require('mysql2/promise');

let connection = null;

const connectDB = async () => {
    if (connection) return connection;

    // Destructure environment variables inside the function to ensure they are loaded
    const {
        DB_HOST,
        DB_USER,
        DB_PASSWORD,
        DB_NAME
    } = process.env;

    try {
        if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
            throw new Error('Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are required');
        }

        connection = await mysql.createConnection({
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
        // Log the full error object for better diagnostics
        console.error('Database connection error:', err);
        // Only exit if not in test environment to allow tests to fail gracefully or use mocks
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw err;
    }
};

module.exports = connectDB;
