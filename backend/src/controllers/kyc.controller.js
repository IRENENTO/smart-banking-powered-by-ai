const KYC = require('../models/KYC');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Simple file upload handler (without multer for now)
exports.uploadKycDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { document_type, file_name, file_size, mime_type } = req.body;

        if (!document_type || !file_name) {
            return res.status(400).json({ msg: 'Document type and file name are required' });
        }

        const validDocTypes = ['national_id', 'selfie', 'passport', 'driving_license'];
        if (!validDocTypes.includes(document_type)) {
            return res.status(400).json({ msg: 'Invalid document type' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Create upload path
        const uploadDir = 'uploads/kyc';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, `${userId}-${Date.now()}-${file_name}`);

        // Save KYC document record
        const kycDocument = await KYC.upload({
            user_id: userId,
            document_type,
            file_path: filePath,
            file_name,
            file_size: file_size || 0,
            mime_type: mime_type || 'application/octet-stream'
        });

        res.status(201).json({
            msg: 'KYC document uploaded successfully',
            document: {
                id: kycDocument.id,
                document_type: kycDocument.document_type,
                upload_status: kycDocument.upload_status,
                uploaded_at: kycDocument.uploaded_at
            }
        });
    } catch (err) {
        console.error('KYC upload error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getKycStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const documents = await KYC.findByUserId(userId);

        res.json({
            kyc_status: user.kyc_status,
            documents: documents.map(doc => ({
                id: doc.id,
                document_type: doc.document_type,
                upload_status: doc.upload_status,
                uploaded_at: doc.uploaded_at,
                rejection_reason: doc.rejection_reason
            }))
        });
    } catch (err) {
        console.error('Get KYC status error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getKycDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const documents = await KYC.findByUserId(userId);

        res.json({
            documents: documents.map(doc => ({
                id: doc.id,
                document_type: doc.document_type,
                file_name: doc.file_name,
                upload_status: doc.upload_status,
                uploaded_at: doc.uploaded_at,
                rejection_reason: doc.rejection_reason
            }))
        });
    } catch (err) {
        console.error('Get KYC documents error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Admin endpoint to review KYC documents
exports.reviewKyc = async (req, res) => {
    try {
        const { document_id, status, rejection_reason } = req.body;

        if (!document_id || !status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid request parameters' });
        }

        const document = await KYC.findById(document_id);
        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        await KYC.updateStatus(document_id, status, rejection_reason);

        // Check if all KYC requirements are met
        if (status === 'approved') {
            const isComplete = await KYC.isKYCComplete(document.user_id);
            if (isComplete) {
                const user = await User.findById(document.user_id);
                if (user) {
                    // Update user KYC status (you'll need to add an update method to User model)
                    // For now, just return success
                }
            }
        }

        res.json({ msg: 'Document review completed', status });
    } catch (err) {
        console.error('Review KYC error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteKycDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentId } = req.params;

        const document = await KYC.findById(documentId);
        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        if (document.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this document' });
        }

        if (document.upload_status === 'approved') {
            return res.status(400).json({ msg: 'Cannot delete approved documents' });
        }

        const deleted = await KYC.delete(documentId, userId);

        if (!deleted) {
            return res.status(404).json({ msg: 'Document not found or already deleted' });
        }

        res.json({ msg: 'KYC document deleted successfully' });
    } catch (err) {
        console.error('Delete KYC document error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

module.exports = exports;

