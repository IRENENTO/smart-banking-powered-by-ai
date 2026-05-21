const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Admin authentication middleware
 * Verifies JWT token and extracts admin information
 */
const adminAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'No token provided, authorization denied',
                code: 'NO_TOKEN'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!decoded.admin) {
            return res.status(401).json({ 
                error: 'Invalid token structure',
                code: 'INVALID_TOKEN'
            });
        }

        req.admin = decoded.admin;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(401).json({ 
            error: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }
};

/**
 * Role-based access control middleware
 * Checks if admin has required role
 */
const adminRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                error: 'Authentication required',
                code: 'NO_AUTH'
            });
        }

        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        
        if (!rolesArray.includes(req.admin.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required_role: rolesArray
            });
        }

        next();
    };
};

/**
 * Super admin only middleware
 */
const superAdminOnly = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ 
            error: 'Authentication required',
            code: 'NO_AUTH'
        });
    }

    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ 
            error: 'This action requires super admin privileges',
            code: 'SUPER_ADMIN_REQUIRED'
        });
    }

    next();
};

/**
 * Audit logging middleware
 * Logs admin actions for audit trail
 */
const auditLog = (req, res, next) => {
    // Store original send method
    const originalSend = res.send;

    // Override send to capture response
    res.send = function (data) {
        // Log only if it's a state-changing operation
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.admin) {
            const connection = global.dbConnection;
            
            connection.execute(
                `INSERT INTO audit_logs 
                (admin_id, action, entity_type, entity_id, description, ip_address) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    req.admin.id,
                    `${req.method} ${req.path}`,
                    req.body?.entity_type || null,
                    req.body?.entity_id || null,
                    req.body?.description || null,
                    req.ip
                ]
            ).catch(err => console.error('Audit log error:', err));
        }

        // Call original send
        return originalSend.call(this, data);
    };

    next();
};

module.exports = {
    adminAuth,
    adminRole,
    superAdminOnly,
    auditLog
};
