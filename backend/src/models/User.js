const bcrypt = require('bcryptjs');
const db = require('../config/db');

class User {
    constructor() {
        this.table = 'users';
    }

    _clampLimitOffset(limit, offset, defaultLimit = 50, maxLimit = 500) {
        const limParsed = parseInt(String(limit), 10);
        const offParsed = parseInt(String(offset), 10);
        const lim = Number.isFinite(limParsed) && limParsed > 0 ? Math.min(maxLimit, limParsed) : defaultLimit;
        const off = Number.isFinite(offParsed) && offParsed >= 0 ? offParsed : 0;
        return [lim, off];
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async generateAccountNumber() {
        let accountNum;
        let exists;
        do {
            accountNum = 'ACC' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            const result = await db.query('SELECT id FROM users WHERE account_number = ?', [accountNum]);
            exists = result.rows.length > 0;
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
        const filters = [];
        const values = [];

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === null) return;
            if (key.includes('.')) return;
            filters.push(`${key} = ?`);
            values.push(query[key]);
        });

        if (filters.length === 0) return null;

        const result = await db.query(
            `SELECT * FROM users WHERE ${filters.join(' AND ')} LIMIT 1`,
            values
        );

        return this.wrapUser(result.rows[0]);
    }

    async create(userData) {
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
            'balance',
            'account_number'
        ];
        const values = [
            userData.name,
            userData.email,
            userData.phone,
            hashedPassword,
            userData.role || 'user',
            userData.email_verified || false,
            userData.profile_completed || false,
            userData.pin_set || false,
            userData.balance !== undefined ? userData.balance : 0.00,
            accountNumber
        ];

        if (userData.otp_code) {
            fields.push('otp_code');
            values.push(userData.otp_code);
        }

        if (userData.otp_expires_at) {
            fields.push('otp_expires_at');
            values.push(userData.otp_expires_at);
        }

        const placeholders = values.map(() => '?').join(', ');

        const result = await db.query(
            `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );

        return this.findById(result.insertId);
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return this.wrapUser(result.rows[0]);
    }

    async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return this.wrapUser(result.rows[0]);
    }

    async findByPhone(phone) {
        const result = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
        if (result.rows.length) return this.wrapUser(result.rows[0]);

        const digits = phone.replace(/\D/g, '');
        const byDigits = await db.query(
            `SELECT * FROM users WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', '') LIKE ?`,
            [`%${digits}`]
        );
        return this.wrapUser(byDigits.rows[0]);
    }

    async findByAccountNumber(accountNumber) {
        const result = await db.query('SELECT * FROM users WHERE account_number = ?', [accountNumber]);
        return this.wrapUser(result.rows[0]);
    }

    async update(id, userData) {
        const fields = [];
        const values = [];

        Object.keys(userData).forEach(key => {
            if (['id', 'created_at', 'updated_at', 'save'].includes(key)) return;
            if (userData[key] === undefined) return;
            if (key === 'password') return;
            fields.push(`${key} = ?`);
            values.push(userData[key]);
        });

        if (userData.password) {
            const hashedPassword = await this.hashPassword(userData.password);
            fields.push(`password = ?`);
            values.push(hashedPassword);
        }

        if (fields.length > 0) {
            values.push(id);
            await db.query(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        return this.findById(id);
    }

    async delete(id) {
        const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.rowCount > 0;
    }

    async findAll(limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT id, name, email, phone, role, email_verified, profile_completed, pin_set, balance, account_number, created_at
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
            [lim, off]
        );
        return result.rows.map((row) => this.wrapUser(row));
    }

    async updateBalance(userId, newBalance) {
        await db.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
    }

    async getBalance(userId) {
        const result = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);
        if (!result.rows[0]) return 0;
        const balance = parseFloat(result.rows[0].balance);
        return Number.isFinite(balance) ? balance : 0;
    }
}

module.exports = new User();
