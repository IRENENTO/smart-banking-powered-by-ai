const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const kycController = require('../controllers/kyc.controller');

/**
 * @swagger
 * /api/kyc/upload:
 *   post:
 *     summary: Upload KYC document
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_type
 *               - file_name
 *             properties:
 *               document_type:
 *                 type: string
 *                 enum: [national_id, selfie, passport, driving_license]
 *               file_name:
 *                 type: string
 *               file_size:
 *                 type: integer
 *               mime_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload', auth, kycController.uploadKycDocument);

/**
 * @swagger
 * /api/kyc/status:
 *   get:
 *     summary: Get KYC status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/status', auth, kycController.getKycStatus);

/**
 * @swagger
 * /api/kyc/documents:
 *   get:
 *     summary: Get KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/documents', auth, kycController.getKycDocuments);

/**
 * @swagger
 * /api/kyc/review:
 *   post:
 *     summary: Admin - Review KYC document
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_id
 *               - status
 *             properties:
 *               document_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document reviewed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.post('/review', auth, kycController.reviewKyc);

/**
 * @swagger
 * /api/kyc/documents/{documentId}:
 *   delete:
 *     summary: Delete a KYC document
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The KYC document ID
 *     responses:
 *       200:
 *         description: KYC document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Cannot delete approved documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this document
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.delete('/documents/:documentId', auth, kycController.deleteKycDocument);

module.exports = router;
