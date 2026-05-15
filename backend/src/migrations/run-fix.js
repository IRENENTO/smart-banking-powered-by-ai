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
        { name: 'risk_score', def: 'DECIMAL(5,2) AFTER status' },
        { name: 'monthly_income', def: 'DECIMAL(18,2) AFTER purpose' },
        { name: 'existing_debt', def: 'DECIMAL(18,2) AFTER monthly_income' },
        { name: 'ai_decision', def: 'TEXT AFTER existing_debt' },
    ];

    for (const col of columns) {
        try {
            await connection.execute(`ALTER TABLE loans ADD COLUMN ${col.name} ${col.def}`);
            console.log(`+ Added column: ${col.name}`);
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log(`  Column already exists: ${col.name}`);
            } else {
                console.error(`  Error adding ${col.name}: ${err.message}`);
            }
        }
    }

    console.log('Migration complete.');
    await connection.end();
};

run().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
