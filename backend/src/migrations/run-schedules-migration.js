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

    // Create payment_schedules table
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS payment_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                amount DECIMAL(15,2) NOT NULL,
                frequency ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'monthly',
                start_date DATE NOT NULL,
                end_date DATE,
                next_payment_date DATE NOT NULL,
                status ENUM('active','paused','completed','cancelled') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('+ Created table: payment_schedules');
    } catch (err) {
        console.error('  Error creating payment_schedules:', err.message);
    }

    // Add columns to payment_schedules
    const schedColumns = [
        { name: 'recipient_type', def: "ENUM('phone','account') DEFAULT 'account' AFTER description" },
        { name: 'recipient_value', def: "VARCHAR(50) NOT NULL DEFAULT '' AFTER recipient_type" },
    ];

    for (const col of schedColumns) {
        try {
            await connection.execute(`ALTER TABLE payment_schedules ADD COLUMN ${col.name} ${col.def}`);
            console.log(`+ Added column: payment_schedules.${col.name}`);
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log(`  Column already exists: payment_schedules.${col.name}`);
            } else {
                console.error(`  Error adding payment_schedules.${col.name}: ${err.message}`);
            }
        }
    }

    // Add columns to loans table
    const loanColumns = [
        { name: 'deduction_amount', def: 'DECIMAL(15,2) DEFAULT NULL AFTER ai_decision' },
        { name: 'deduction_period', def: "ENUM('daily','weekly','monthly') DEFAULT NULL AFTER deduction_amount" },
        { name: 'paid_amount', def: 'DECIMAL(15,2) DEFAULT 0.00 AFTER deduction_period' },
        { name: 'next_deduction_date', def: 'DATE DEFAULT NULL AFTER paid_amount' },
        { name: 'extensions', def: 'JSON DEFAULT NULL AFTER next_deduction_date' },
    ];

    for (const col of loanColumns) {
        try {
            await connection.execute(`ALTER TABLE loans ADD COLUMN ${col.name} ${col.def}`);
            console.log(`+ Added column: loans.${col.name}`);
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log(`  Column already exists: loans.${col.name}`);
            } else {
                console.error(`  Error adding loans.${col.name}: ${err.message}`);
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
