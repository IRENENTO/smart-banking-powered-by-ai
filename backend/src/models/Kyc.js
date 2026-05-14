class KYC {
    constructor() {
        this.table = 'kyc_documents';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Upload KYC document
    async upload(kycData) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO kyc_documents (user_id, document_type, file_path, file_name, file_size, mime_type, upload_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            kycData.user_id,
            kycData.document_type,
            kycData.file_path,
            kycData.file_name,
            kycData.file_size,
            kycData.mime_type,
            kycData.upload_status || 'pending'
        ]);

        return this.findById(result.insertId);
    }

    // Find document by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM kyc_documents WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Find documents by user ID
    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM kyc_documents WHERE user_id = ? ORDER BY uploaded_at DESC', [userId]);
        return rows;
    }

    // Find document by user ID and type
    async findByUserIdAndType(userId, documentType) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM kyc_documents WHERE user_id = ? AND document_type = ?', [userId, documentType]);
        return rows[0] || null;
    }

    // Update document status
    async updateStatus(id, status, rejectionReason = null) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE kyc_documents 
            SET upload_status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, rejectionReason, id]);

        return result.affectedRows > 0;
    }

    // Get KYC status for user
    async getUserKYCStatus(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT document_type, upload_status FROM kyc_documents 
            WHERE user_id = ? 
            ORDER BY uploaded_at DESC
        `, [userId]);

        return rows;
    }

    // Check if all required documents are approved
    async isKYCComplete(userId) {
        const connection = this.getConnection();
        const requiredTypes = ['national_id', 'selfie'];
        
        for (const type of requiredTypes) {
            const [rows] = await connection.execute(`
                SELECT COUNT(*) as count FROM kyc_documents 
                WHERE user_id = ? AND document_type = ? AND upload_status = 'approved'
            `, [userId, type]);

            if (!rows[0].count) return false;
        }

        return true;
    }

    // Delete KYC document by ID
    async delete(id, userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM kyc_documents WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Delete all KYC documents for a user
    async deleteByUserId(userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute('DELETE FROM kyc_documents WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = KYC;
