const bcrypt = require('bcryptjs');

class User {
    constructor() {
        this.table = 'users';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Hash password
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    // Compare password
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Generate account number
    async generateAccountNumber() {
        const connection = this.getConnection();
        let accountNum;
        let exists;
        do {
            accountNum = 'ACC' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            const [rows] = await connection.execute('SELECT id FROM users WHERE account_number = ?', [accountNum]);
            exists = rows.length > 0;
        } while (exists);
        return accountNum;
    }

    wrapUser(row) {
        if (!row) return null;
        const self = this;
        const wrapped = { ...row };

        wrapped.save = async function () {
            const dataToSave = { ...this };
            delete dataToSave.save;
            delete dataToSave.id;
            delete dataToSave.created_at;
            delete dataToSave.updated_at;
            const updated = await self.update(this.id, dataToSave);
            Object.assign(this, updated);
            return this;
        };

        return wrapped;
    }

    async findOne(query) {
        const connection = this.getConnection();
        const filters = [];
        const values = [];

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === null) return;
            if (key.includes('.')) return;
            filters.push(`${key} = ?`);
            values.push(query[key]);
        });

        if (filters.length === 0) return null;

        const [rows] = await connection.execute(
            `SELECT * FROM users WHERE ${filters.join(' AND ')} LIMIT 1`,
            values
        );

        return this.wrapUser(rows[0]);
    }

    // Create new user
    async create(userData) {
        const connection = this.getConnection();
        const hashedPassword = await this.hashPassword(userData.password);
        const accountNumber = await this.generateAccountNumber();

        const fields = [
            'name',
            'email',
            'phone',
            'password',
            'role',
            'email_verified',
            'profile_completed',
            'pin_set',
            'kyc_status',
            'balance',
            'account_number'
        ];
        let placeholders = fields.map(() => '?').join(', ');
        const values = [
            userData.name,
            userData.email,
            userData.phone,
            hashedPassword,
            userData.role || 'user',
            userData.email_verified || false,
            userData.profile_completed || false,
            userData.pin_set || false,
            userData.kyc_status || 'pending',
            0.00,
            accountNumber
        ];

        if (userData.otp_code) {
            fields.push('otp_code');
            placeholders += ', ?';
            values.push(userData.otp_code);
        }

        if (userData.otp_expires_at) {
            fields.push('otp_expires_at');
            placeholders += ', ?';
            values.push(userData.otp_expires_at);
        }

        const [result] = await connection.execute(
            `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );

        return this.findById(result.insertId);
    }

    // Find user by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
        return this.wrapUser(rows[0]);
    }

    // Find user by email
    async findByEmail(email) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        return this.wrapUser(rows[0]);
    }

    // Find user by phone
    async findByPhone(phone) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE phone = ?', [phone]);
        return this.wrapUser(rows[0]);
    }

    // Find user by account number
    async findByAccountNumber(accountNumber) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE account_number = ?', [accountNumber]);
        return this.wrapUser(rows[0]);
    }

    // Update user
    async update(id, userData) {
        const connection = this.getConnection();
        const fields = [];
        const values = [];

        // Build dynamic update query
        Object.keys(userData).forEach(key => {
            if (['id', 'created_at', 'updated_at', 'save'].includes(key)) return;
            if (userData[key] === undefined) return;
            if (key === 'password') return;
            fields.push(`${key} = ?`);
            values.push(userData[key]);
        });

        // Handle password hashing separately
        if (userData.password) {
            const hashedPassword = await this.hashPassword(userData.password);
            fields.push('password = ?');
            values.push(hashedPassword);
        }

        values.push(id);

        if (fields.length > 0) {
            await connection.execute(`
                UPDATE users SET ${fields.join(', ')} WHERE id = ?
            `, values);
        }

        return this.findById(id);
    }

    // Delete user
    async delete(id) {
        const connection = this.getConnection();
        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get all users
    async findAll(limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT id, name, email, phone, role, email_verified, profile_completed, pin_set, kyc_status, balance, account_number, created_at
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        return rows.map((row) => this.wrapUser(row));
    }

    // Update user balance
    async updateBalance(userId, newBalance) {
        const connection = this.getConnection();
        await connection.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
    }

    // Get user balance
    async getBalance(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT balance FROM users WHERE id = ?', [userId]);
        return rows[0] ? rows[0].balance : 0;
    }
}

module.exports = new User();
