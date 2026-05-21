const mysql = require('mysql2/promise');

const connectDB = async () => {
    const {
        DB_HOST,
        DB_USER,
        DB_PASSWORD,
        DB_NAME
    } = process.env;

    try {
        const missingVars = [];
        if (!DB_HOST) missingVars.push('DB_HOST');
        if (!DB_USER) missingVars.push('DB_USER');
        if (!DB_PASSWORD) missingVars.push('DB_PASSWORD');
        if (!DB_NAME) missingVars.push('DB_NAME');

        if (missingVars.length > 0) {
            throw new Error(`Missing database environment variables: ${missingVars.join(', ')}`);
        }

        console.log(`Attempting to connect to MySQL at ${DB_HOST} with user ${DB_USER}...`);

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
