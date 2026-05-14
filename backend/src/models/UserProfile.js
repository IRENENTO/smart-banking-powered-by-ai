class UserProfile {
    constructor() {
        this.table = 'user_profiles';
    }

    getConnection() {
        return global.dbConnection;
    }

    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        return rows[0] || null;
    }

    async create(userId, profileData) {
        const connection = this.getConnection();
        await connection.execute(
            `INSERT INTO user_profiles (user_id, date_of_birth, address, national_id)
             VALUES (?, ?, ?, ?)`,
            [userId, profileData.dateOfBirth, profileData.address, profileData.nationalId]
        );
        return this.findByUserId(userId);
    }

    async update(userId, profileData) {
        const connection = this.getConnection();
        await connection.execute(
            `UPDATE user_profiles
             SET date_of_birth = ?, address = ?, national_id = ?, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [profileData.dateOfBirth, profileData.address, profileData.nationalId, userId]
        );
        return this.findByUserId(userId);
    }

    async upsert(userId, profileData) {
        const existing = await this.findByUserId(userId);
        if (existing) {
            return this.update(userId, profileData);
        }
        return this.create(userId, profileData);
    }

    async deleteByUserId(userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute('DELETE FROM user_profiles WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = new UserProfile();
