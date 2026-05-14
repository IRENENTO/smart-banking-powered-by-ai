# AI Smart Lend Banking Backend - Setup & API Guide

## Overview

This backend provides a comprehensive banking API with authentication, account management, transactions, loans, AI-powered insights, and KYC verification. It uses Node.js + Express + MySQL.

## Prerequisites

- Node.js v14+ 
- MySQL 5.7+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_banking_powered_by_ai
JWT_SECRET=your_jwt_secret_key
AI_ENGINE_URL=http://localhost:8000
NODE_ENV=development
```

### 3. Database Setup

#### Create Database

```sql
CREATE DATABASE IF NOT EXISTS smart_banking_powered_by_ai;
```

#### Create Base Users Table (if not exists)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    balance DECIMAL(18, 2) DEFAULT 0.00,
    account_number VARCHAR(50) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    pin_set BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    date_of_birth DATE,
    address TEXT,
    national_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);
```

#### Run Migration

Execute the migration script to create all required tables:

```bash
mysql -u root -p < database/migration.sql
```

Or run it directly in MySQL:

```sql
SOURCE database/migration.sql;
```

## Starting the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start on `http://localhost:5000` by default.

## API Documentation

### Access Swagger UI

Once the server is running, visit:

```
http://localhost:5000/api-docs
```

### API Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.aibanking.com/api`

## Core API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user

### Profile Management

- **GET** `/api/profile` - Get user profile
- **PUT** `/api/profile` - Update user profile
- **POST** `/api/profile/complete` - Complete profile with KYC data

### Account Management

- **GET** `/api/account` - Get account details
- **GET** `/api/account/balance` - Get current balance

### Transactions

- **GET** `/api/transactions` - Get transaction history
- **GET** `/api/transactions/balance` - Get balance
- **POST** `/api/transactions/deposit` - Make a deposit
- **POST** `/api/transactions/withdraw` - Make a withdrawal

### Loans

- **POST** `/api/loans` - Apply for a loan
- **GET** `/api/loans` - Get user's loans
- **GET** `/api/loans/{loanId}` - Get specific loan
- **PUT** `/api/loans/status` - Admin: Update loan status

### AI Insights

- **GET** `/api/insights` - Get user insights
- **POST** `/api/insights/generate` - Generate new insights
- **PUT** `/api/insights/{insightId}/read` - Mark insight as read
- **DELETE** `/api/insights/{insightId}` - Delete insight

### KYC (Know Your Customer)

- **POST** `/api/kyc/upload` - Upload KYC document
- **GET** `/api/kyc/status` - Get KYC status
- **GET** `/api/kyc/documents` - Get KYC documents
- **POST** `/api/kyc/review` - Admin: Review KYC document

## Database Schema

### Tables Created

1. **users** - User accounts and authentication
2. **accounts** - User account balances and details
3. **transactions** - Transaction history
4. **loans** - Loan applications and status
5. **ai_insights** - AI-generated insights and recommendations
6. **kyc_documents** - KYC verification documents
7. **otp_codes** - OTP codes for verification
8. **user_profiles** - Extended user profile data
9. **user_security** - User security settings (PIN, etc.)

## Key Features

### 1. Authentication

- JWT-based authentication
- Password hashing with bcryptjs
- Email and phone validation
- Session management with express-session

### 2. Account Management

- Automatic account creation on first login
- Balance tracking
- Multi-currency support (default: RWF)

### 3. Transactions

- Deposit and withdrawal transactions
- Transaction history with reference numbers
- Balance before/after tracking
- Transaction status management

### 4. Loans

- Loan application process
- AI-powered risk assessment
- Dummy risk scoring (when AI engine unavailable)
- Approval/rejection decisions

### 5. AI Insights

- Transaction-based insights
- Spending analysis
- Savings recommendations
- Risk alerts

### 6. KYC Verification

- Document upload support
- Status tracking
- Admin review workflow
- Support for multiple document types

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": {
    "statusCode": 400,
    "message": "Invalid input data"
  }
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Example:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." http://localhost:5000/api/profile
```

## Testing with Swagger

1. Register a new user via `/api/auth/register`
2. Login via `/api/auth/login` to get JWT token
3. Click "Authorize" button in Swagger UI
4. Paste the token (without "Bearer" prefix)
5. Test all protected endpoints

## Sample Requests

### 1. Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250788123456",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Deposit

```bash
curl -X POST http://localhost:5000/api/transactions/deposit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Monthly salary"
  }'
```

### 4. Apply for Loan

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "duration": 12,
    "purpose": "Business expansion",
    "monthlyIncome": 10000,
    "existingDebt": 5000
  }'
```

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── passport.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   ├── insights.controller.js
│   │   ├── kyc.controller.js
│   │   ├── loan.controller.js
│   │   ├── profile.controller.js
│   │   ├── transaction.controller.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── ...
│   ├── models/
│   │   ├── Account.js
│   │   ├── AIInsight.js
│   │   ├── KYC.js
│   │   ├── Loan.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── auth.routes.js
│   │   ├── insights.routes.js
│   │   ├── kyc.routes.js
│   │   ├── loan.routes.js
│   │   ├── transaction.routes.js
│   │   └── ...
│   ├── services/
│   │   └── ai.service.js
│   └── server.js
├── database/
│   └── migration.sql
├── package.json
└── README.md
```

## Troubleshooting

### Database Connection Error

```
MySQL Connected to smart_banking_powered_by_ai...
Database connection error: ER_ACCESS_DENIED_FOR_USER
```

**Solution:** Check database credentials in `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=smart_banking_powered_by_ai
```

### Migration SQL Error

**Solution:** Make sure the database exists:

```sql
CREATE DATABASE IF NOT EXISTS smart_banking_powered_by_ai;
USE smart_banking_powered_by_ai;
SOURCE database/migration.sql;
```

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:** Change PORT in `.env` or kill the process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Swagger Documentation Not Loading

1. Clear browser cache
2. Visit `http://localhost:5000/` to verify server is running
3. Check that route files have proper JSDoc comments

## Performance Optimization

### Database Indexes

The migration script automatically creates indexes on:

- `users.email`
- `users.phone`
- `transactions.user_id`
- `transactions.created_at`
- `loans.user_id`
- `ai_insights.user_id`

### Connection Pooling

The MySQL connection is configured with:

```javascript
{
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true
}
```

## Security Considerations

1. **JWT Tokens** - Set strong `JWT_SECRET` in production
2. **Password Hashing** - Using bcryptjs with 10 salt rounds
3. **CORS** - Configure allowed origins in production
4. **Rate Limiting** - Consider adding rate limiting middleware
5. **SQL Injection** - Using prepared statements with mysql2/promise
6. **HTTPS** - Use HTTPS in production

## Next Steps

1. Connect frontend to these APIs
2. Deploy AI engine on port 8000
3. Configure production environment
4. Set up CI/CD pipeline
5. Enable HTTPS
6. Add rate limiting
7. Set up monitoring and logging

## Support

For issues or questions, please refer to:
- API Documentation: `http://localhost:5000/api-docs`
- Backend Tests: `npm test`
- Logs: Check console output

