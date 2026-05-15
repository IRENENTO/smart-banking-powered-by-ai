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

    const columns = [
        { name: 'auto_deduction_amount', def: 'DECIMAL(15,2) DEFAULT NULL AFTER current_amount' },
        { name: 'auto_deduction_period', def: "ENUM('daily','weekly','monthly') DEFAULT NULL AFTER auto_deduction_amount" },
        { name: 'last_deduction_date', def: "DATE DEFAULT NULL AFTER auto_deduction_period" },
    ];

    for (const col of columns) {
        try {
            await connection.execute(`ALTER TABLE savings_goals ADD COLUMN ${col.name} ${col.def}`);
            console.log(`+ Added column: savings_goals.${col.name}`);
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log(`  Column already exists: savings_goals.${col.name}`);
            } else {
                console.error(`  Error adding savings_goals.${col.name}: ${err.message}`);
            }
        }
    }

    console.log('Savings auto-deduction migration complete.');
    await connection.end();
};

run().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
