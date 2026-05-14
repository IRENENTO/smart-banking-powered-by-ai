const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'irene2003',
    database: 'smart_banking_powered_by_ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Demo data
const demoUsers = [
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+250788123456',
        password: 'password123',
        role: 'user',
        email_verified: true,
        profile_completed: true,
        pin_set: true,
        balance: 5000.00
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+250788234567',
        password: 'password123',
        role: 'user',
        email_verified: true,
        profile_completed: true,
        pin_set: true,
        balance: 3500.00
    },
    {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+250788345678',
        password: 'password123',
        role: 'user',
        email_verified: true,
        profile_completed: true,
        pin_set: false,
        balance: 1200.00
    },
    {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+250788456789',
        password: 'password123',
        role: 'user',
        email_verified: false,
        profile_completed: false,
        pin_set: false,
        balance: 800.00
    },
    {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '+250788567890',
        password: 'password123',
        role: 'user',
        email_verified: true,
        profile_completed: true,
        pin_set: true,
        balance: 7500.00
    }
];

const demoProfiles = [
    {
        date_of_birth: '1990-05-15',
        address: '123 Main St, Kigali, Rwanda',
        national_id: '1199051234567890'
    },
    {
        date_of_birth: '1985-08-22',
        address: '456 Oak Ave, Kigali, Rwanda',
        national_id: '1198082298765432'
    },
    {
        date_of_birth: '1992-03-10',
        address: '789 Pine Rd, Kigali, Rwanda',
        national_id: '1192031012345678'
    },
    {
        date_of_birth: '1995-11-28',
        address: '321 Elm St, Kigali, Rwanda',
        national_id: '1195112856789012'
    },
    {
        date_of_birth: '1988-07-14',
        address: '654 Maple Dr, Kigali, Rwanda',
        national_id: '1198071498765432'
    }
];

const demoTransactions = [
    { type: 'deposit', amount: 1000.00, description: 'Initial deposit' },
    { type: 'deposit', amount: 500.00, description: 'Salary deposit' },
    { type: 'withdrawal', amount: 200.00, description: 'ATM withdrawal' },
    { type: 'payment', amount: 150.00, description: 'Grocery shopping' },
    { type: 'transfer', amount: 300.00, description: 'Transfer to friend' },
    { type: 'deposit', amount: 750.00, description: 'Freelance payment' },
    { type: 'withdrawal', amount: 100.00, description: 'Cash withdrawal' },
    { type: 'payment', amount: 50.00, description: 'Restaurant bill' },
    { type: 'transfer', amount: 200.00, description: 'Rent payment' },
    { type: 'deposit', amount: 2000.00, description: 'Bonus payment' }
];

const demoLoans = [
    {
        amount: 5000.00,
        purpose: 'Home renovation',
        duration_months: 12,
        interest_rate: 8.5,
        status: 'approved'
    },
    {
        amount: 3000.00,
        purpose: 'Car purchase',
        duration_months: 24,
        interest_rate: 9.0,
        status: 'disbursed'
    },
    {
        amount: 1500.00,
        purpose: 'Emergency fund',
        duration_months: 6,
        interest_rate: 10.0,
        status: 'pending'
    }
];

const demoSavingsGoals = [
    {
        name: 'Emergency Fund',
        target_amount: 10000.00,
        current_amount: 3500.00,
        target_date: '2024-12-31',
        status: 'active'
    },
    {
        name: 'Vacation Fund',
        target_amount: 3000.00,
        current_amount: 1200.00,
        target_date: '2024-08-31',
        status: 'active'
    },
    {
        name: 'New Laptop',
        target_amount: 1500.00,
        current_amount: 1500.00,
        target_date: '2024-06-30',
        status: 'completed'
    },
    {
        name: 'Home Down Payment',
        target_amount: 50000.00,
        current_amount: 8000.00,
        target_date: '2025-12-31',
        status: 'active'
    }
];

const demoNotifications = [
    {
        title: 'Welcome to AI Banking',
        message: 'Your account has been successfully created. Start exploring our features!',
        type: 'info'
    },
    {
        title: 'Deposit Received',
        message: 'You have received a deposit of $1,000.00',
        type: 'success'
    },
    {
        title: 'Loan Application Approved',
        message: 'Your loan application for $5,000.00 has been approved.',
        type: 'success'
    },
    {
        title: 'Security Alert',
        message: 'A new login was detected from your account.',
        type: 'warning'
    },
    {
        title: 'Payment Reminder',
        message: 'Your monthly loan payment is due in 3 days.',
        type: 'warning'
    }
];

// Seeding functions
async function seedUsers() {
    const connection = await mysql.createConnection(dbConfig);
    
    for (let i = 0; i < demoUsers.length; i++) {
        const user = demoUsers[i];
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const accountNumber = `ACC${String(i + 1).padStart(6, '0')}`;
        
        try {
            await connection.execute(`
                INSERT INTO users (name, email, phone, password, role, email_verified, profile_completed, pin_set, balance, account_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.name,
                user.email,
                user.phone,
                hashedPassword,
                user.role,
                user.email_verified,
                user.profile_completed,
                user.pin_set,
                user.balance,
                accountNumber
            ]);
            
            console.log(`✅ User created: ${user.name} (${accountNumber})`);
        } catch (error) {
            if (error.code !== 'ER_DUP_ENTRY') {
                console.error(`❌ Error creating user ${user.name}:`, error.message);
            }
        }
    }
    
    await connection.end();
}

async function seedProfiles() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [users] = await connection.execute('SELECT id FROM users WHERE role = "user" ORDER BY id LIMIT 5');
        
        for (let i = 0; i < users.length && i < demoProfiles.length; i++) {
            const profile = demoProfiles[i];
            const userId = users[i].id;
            
            await connection.execute(`
                INSERT INTO user_profiles (user_id, date_of_birth, address, national_id)
                VALUES (?, ?, ?, ?)
            `, [userId, profile.date_of_birth, profile.address, profile.national_id]);
            
            console.log(`✅ Profile created for user ID: ${userId}`);
        }
    } catch (error) {
        console.error('❌ Error creating profiles:', error.message);
    }
    
    await connection.end();
}

async function seedTransactions() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [users] = await connection.execute('SELECT id, balance FROM users WHERE role = "user" ORDER BY id LIMIT 5');
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            let currentBalance = parseFloat(user.balance);
            
            for (let j = 0; j < 5; j++) { // 5 transactions per user
                const transaction = demoTransactions[j % demoTransactions.length];
                const referenceNumber = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
                
                let balanceBefore = currentBalance;
                let balanceAfter = currentBalance;
                
                if (transaction.type === 'deposit') {
                    balanceAfter = currentBalance + transaction.amount;
                } else if (transaction.type === 'withdrawal' || transaction.type === 'payment') {
                    balanceAfter = Math.max(0, currentBalance - transaction.amount);
                }
                
                await connection.execute(`
                    INSERT INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    user.id,
                    transaction.type,
                    transaction.amount,
                    transaction.description,
                    referenceNumber,
                    'completed',
                    balanceBefore,
                    balanceAfter
                ]);
                
                currentBalance = balanceAfter;
            }
            
            console.log(`✅ Transactions created for user ID: ${user.id}`);
        }
    } catch (error) {
        console.error('❌ Error creating transactions:', error.message);
    }
    
    await connection.end();
}

async function seedLoans() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [users] = await connection.execute('SELECT id FROM users WHERE role = "user" ORDER BY id LIMIT 3');
        
        for (let i = 0; i < users.length && i < demoLoans.length; i++) {
            const loan = demoLoans[i];
            const userId = users[i].id;
            const monthlyPayment = (loan.amount * (1 + loan.interest_rate / 100)) / loan.duration_months;
            const totalAmount = loan.amount + (loan.amount * loan.interest_rate / 100);
            
            await connection.execute(`
                INSERT INTO loans (user_id, amount, purpose, duration_months, interest_rate, monthly_payment, total_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId,
                loan.amount,
                loan.purpose,
                loan.duration_months,
                loan.interest_rate,
                monthlyPayment,
                totalAmount,
                loan.status
            ]);
            
            console.log(`✅ Loan created for user ID: ${userId}`);
        }
    } catch (error) {
        console.error('❌ Error creating loans:', error.message);
    }
    
    await connection.end();
}

async function seedSavingsGoals() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [users] = await connection.execute('SELECT id FROM users WHERE role = "user" ORDER BY id LIMIT 4');
        
        for (let i = 0; i < users.length && i < demoSavingsGoals.length; i++) {
            const goal = demoSavingsGoals[i];
            const userId = users[i].id;
            
            await connection.execute(`
                INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                userId,
                goal.name,
                goal.target_amount,
                goal.current_amount,
                goal.target_date,
                goal.status
            ]);
            
            console.log(`✅ Savings goal created for user ID: ${userId}`);
        }
    } catch (error) {
        console.error('❌ Error creating savings goals:', error.message);
    }
    
    await connection.end();
}

async function seedNotifications() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [users] = await connection.execute('SELECT id FROM users WHERE role = "user" ORDER BY id LIMIT 5');
        
        for (let i = 0; i < users.length; i++) {
            const userId = users[i].id;
            
            for (let j = 0; j < 3; j++) { // 3 notifications per user
                const notification = demoNotifications[j % demoNotifications.length];
                
                await connection.execute(`
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES (?, ?, ?, ?)
                `, [userId, notification.title, notification.message, notification.type]);
            }
            
            console.log(`✅ Notifications created for user ID: ${userId}`);
        }
    } catch (error) {
        console.error('❌ Error creating notifications:', error.message);
    }
    
    await connection.end();
}

// Main seeding function
async function seedAllData() {
    console.log('🌱 Starting demo data seeding...\n');
    
    try {
        await seedUsers();
        console.log('');
        
        await seedProfiles();
        console.log('');
        
        await seedTransactions();
        console.log('');
        
        await seedLoans();
        console.log('');
        
        await seedSavingsGoals();
        console.log('');
        
        await seedNotifications();
        console.log('');
        
        console.log('🎉 Demo data seeding completed successfully!');
        console.log('\n📊 Demo Data Summary:');
        console.log('• 5 demo users with different verification statuses');
        console.log('• User profiles with personal information');
        console.log('• Transaction history for each user');
        console.log('• Loan applications with different statuses');
        console.log('• Savings goals with progress tracking');
        console.log('• System notifications');
        console.log('\n🔑 Demo Login Credentials:');
        console.log('Email: john.smith@example.com');
        console.log('Password: password123');
        console.log('\n🌐 API Documentation: http://localhost:5001/api-docs');
        
    } catch (error) {
        console.error('❌ Error during seeding:', error.message);
        process.exit(1);
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedAllData();
}

module.exports = {
    seedAllData,
    seedUsers,
    seedProfiles,
    seedTransactions,
    seedLoans,
    seedSavingsGoals,
    seedNotifications
};
