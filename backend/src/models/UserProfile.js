const db = require('../config/db');

class UserProfile {
    constructor() {
        this.table = 'user_profiles';
    }

    async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = $1',
            [userId]
        );
        return result.rows[0] || null;
    }

    async create(userId, profileData) {
        await db.query(
            `INSERT INTO user_profiles (user_id, date_of_birth, address, national_id)
             VALUES ($1, $2, $3, $4)`,
            [userId, profileData.dateOfBirth, profileData.address, profileData.nationalId]
        );
        return this.findByUserId(userId);
    }

    async update(userId, profileData) {
        await db.query(
            `UPDATE user_profiles
             SET date_of_birth = $1, address = $2, national_id = $3, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4`,
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
        const result = await db.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
        return result.rowCount > 0;
    }
}

module.exports = new UserProfile();
