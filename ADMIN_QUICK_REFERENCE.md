# Admin System - Quick Reference Guide

## 🚀 Quick Start

### 1. Setup Admin User
```sql
-- Update password for admin user
UPDATE admins 
SET password_hash = '$2a$10$Y5G7VvXHZvJvF8m0O4w8J.DjlHZvUZvUZvUZvUZvUZvUZvUZvUZvU'
WHERE email = 'smartbankingpoweredbyai@gmail.com';
```

### 2. Access Admin Dashboard
```
URL: http://localhost:3000/admin/login
Email: smartbankingpoweredbyai@gmail.com
Password: [your-secure-password]
```

---

## 📋 File Structure

### Backend Files
```
backend/
├── src/
│   ├── routes/
│   │   ├── admin-auth.routes.js      # Auth endpoints
│   │   └── admin.routes.js           # Dashboard endpoints
│   ├── controllers/
│   │   └── admin.controller.js       # Business logic
│   └── middleware/
│       └── admin.middleware.js       # Auth & RBAC
└── migrations/
    └── 001_create_admin_tables.sql   # Database schema
```

### Frontend Files
```
web/
├── src/
│   └── pages/
│       ├── AdminLogin.tsx            # Login page
│       └── AdminDashboard.tsx        # Dashboard
└── ADMIN_DASHBOARD_GUIDE.md          # Full documentation
```

---

## 🔐 Authentication Flow

```
1. User submits login credentials
   ↓
2. Backend validates email/password
   ↓
3. Generate JWT token (24h expiration)
   ↓
4. Return token + admin data
   ↓
5. Frontend stores in localStorage
   ↓
6. Include token in all API requests
   ↓
7. Backend verifies token on each request
```

---

## 📊 Dashboard Sections

| Tab | Features | Real-time |
|-----|----------|-----------|
| **Overview** | Stats, Charts, Analytics | ✅ 30s auto-refresh |
| **Users** | List, Search, Status mgmt | ✅ On-demand |
| **Transactions** | Monitor, Filter, Fraud alerts | ✅ On-demand |
| **Loans** | Applications, Risk scores | ✅ On-demand |
| **Security** | Fraud alerts, KYC pending | ✅ On-demand |

---

## 🔌 API Endpoints Reference

### Authentication
```bash
# Login
POST /api/admin/auth/login
Body: { "email": "...", "password": "..." }
Response: { "admin": {...}, "token": "jwt..." }

# Verify token
GET /api/admin/auth/verify
Headers: { "Authorization": "Bearer jwt..." }

# Logout
POST /api/admin/auth/logout
Headers: { "Authorization": "Bearer jwt..." }
```

### Statistics
```bash
# Dashboard stats
GET /api/admin/stats
Headers: { "Authorization": "Bearer jwt..." }

# Detailed analytics
GET /api/admin/analytics
Headers: { "Authorization": "Bearer jwt..." }
```

### Users
```bash
# Get users (with pagination)
GET /api/admin/users?page=1&limit=10&search=email

# Get user details
GET /api/admin/users/123

# Update user status
PATCH /api/admin/users/123/status
Body: { "status": "active|inactive|suspended" }
```

### Transactions
```bash
# Get transactions
GET /api/admin/transactions?page=1&limit=10&status=completed&type=transfer

# Get payments
GET /api/admin/payments?page=1&limit=10
```

### Loans
```bash
# Get loans
GET /api/admin/loans?page=1&limit=10
```

### KYC
```bash
# Get KYC submissions
GET /api/admin/kyc?page=1&limit=10

# Verify KYC
PATCH /api/admin/kyc/456/verify
Body: { "status": "verified|rejected", "notes": "..." }
```

### Security
```bash
# Get fraud alerts
GET /api/admin/fraud-alerts?page=1&limit=10

# Review fraud alert
PATCH /api/admin/fraud-alerts/789/review
Body: { "status": "resolved|false_positive", "action_taken": "..." }

# Get activity logs
GET /api/admin/activity-logs?page=1&limit=10

# Get login history
GET /api/admin/login-history?page=1&limit=10
```

### Admin Only
```bash
# Get audit logs (super admin only)
GET /api/admin/audit-logs?page=1&limit=10

# Create admin (super admin only)
POST /api/admin/admins
Body: { "email": "...", "password": "...", "name": "...", "role": "admin" }

# Get admins (super admin only)
GET /api/admin/admins

# Update admin role (super admin only)
PATCH /api/admin/admins/111/role
Body: { "role": "super_admin|admin|moderator" }
```

---

## 💻 Frontend Integration Example

```typescript
// Fetch admin data
const fetchStats = async () => {
    const token = localStorage.getItem('admin_token');
    
    const response = await axios.get(
        'http://localhost:3001/api/admin/stats',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data.data;
};

// Update user status
const updateUserStatus = async (userId: number, status: string) => {
    const token = localStorage.getItem('admin_token');
    
    await axios.patch(
        `http://localhost:3001/api/admin/users/${userId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};
```

---

## 📈 Real-Time Features

### Auto-Refresh (30 seconds)
- Dashboard statistics update automatically
- No action needed by admin
- Controlled by interval in useEffect

### Manual Refresh
- Click refresh button in header
- Fetches latest data immediately
- Shows loading spinner during fetch

### Live Updates
- Charts update with new data
- Tables refresh with latest entries
- Fraud alerts trigger immediately

---

## 🔒 Security Checklist

Before production deployment:

- [ ] Change default admin password
- [ ] Update database credentials
- [ ] Enable HTTPS/SSL
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Configure backups
- [ ] Monitor audit logs regularly

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid credentials" on login
```
Solution: Verify password hash in database
- Check admins table for correct email
- Verify password_hash field is populated
- Ensure bcrypt hash is valid
```

### Issue: "No token, authorization denied"
```
Solution: Ensure token is sent correctly
- Check localStorage has 'admin_token'
- Verify Authorization header format
- Check token hasn't expired
```

### Issue: "Insufficient permissions"
```
Solution: Verify admin role
- Check admin role in database
- Ensure role matches endpoint requirements
- Super admin for audit logs access
```

### Issue: CORS errors
```
Solution: Configure CORS on backend
- Add frontend URL to CORS whitelist
- Check backend/src/server.js
- Verify credentials: true
```

---

## 📞 Testing Commands

### Test Admin Login
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smartbankingpoweredbyai@gmail.com",
    "password": "your-password"
  }'
```

### Test Get Stats
```bash
curl -X GET http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Get Users
```bash
curl -X GET "http://localhost:3001/api/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Schema Quick Reference

### admins table
```sql
id (PK), email (UNIQUE), password_hash, name, role, status, last_login
```

### fraud_alerts table
```sql
id (PK), user_id (FK), alert_type, severity, status, description, reviewed_by
```

### login_history table
```sql
id (PK), user_id (FK), ip_address, login_method, status, location, device_info
```

### audit_logs table
```sql
id (PK), admin_id (FK), action, entity_type, old_values, new_values, ip_address
```

---

## 🎯 Performance Tips

1. **Database:** Use proper indexes on frequently queried columns
2. **API:** Implement pagination (max 10-20 items per page)
3. **Frontend:** Debounce search inputs
4. **Charts:** Limit data points to last 30-60 days
5. **Caching:** Cache analytics data for 5-10 minutes

---

## 📚 Additional Resources

- **Full Guide:** [ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)
- **API Docs:** http://localhost:3001/api-docs (Swagger)
- **Code Comments:** Review controller files for detailed logic

---

**Version:** 1.0.0  
**Last Updated:** May 13, 2026  
**Status:** Production Ready ✅
