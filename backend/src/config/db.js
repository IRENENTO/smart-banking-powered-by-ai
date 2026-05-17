const mysql = require('mysql2/promise');

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
} = process.env;

const connectDB = async () => {
    try {
        if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
            throw new Error('Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are required');
        }
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
