# 🚀 AI Banking Platform - Complete Setup Guide

## 📋 Overview
This guide will help you set up the complete AI Banking platform with MySQL database, payment APIs, and demo data. The system includes user authentication, transaction management, loan applications, and a comprehensive frontend.

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **MySQL Server** (v8.0 or higher)
- **Git**
- **Code Editor** (VS Code recommended)

### Database Credentials
- **Database Name**: `smart_banking_powered_by_ai`
- **Username**: `root`
- **Password**: `irene2003`

## 🗄️ Database Setup

### 1. Create Database
```sql
CREATE DATABASE smart_banking_powered_by_ai;
```

### 2. Run Migration Script
```bash
cd backend
mysql -u root -pirene2003 smart_banking_powered_by_ai < src/migrations/mysql-migration.sql
```

## 📦 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Install Additional Packages
```bash
npm install --no-optional --no-audit --no-fund mysql2 swagger-ui-express swagger-jsdoc
```

### 3. Environment Configuration
Create `.env` file in `backend/` directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ai_banking
JWT_SECRET=supersecretkey
AI_ENGINE_URL=http://localhost:8000

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

TWITTER_CONSUMER_KEY=your_twitter_consumer_key_here
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret_here
```

### 4. Seed Demo Data
```bash
node src/seeders/demo-data.js
```

### 5. Start Backend Server
```bash
npm start
```

**Backend will be available at:** `http://localhost:5001`

## 🌐 Frontend Setup

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Start Frontend Server
```bash
npm start
```

**Frontend will be available at:** `http://localhost:3000`

## 📚 API Documentation

### Swagger UI
- **URL**: `http://localhost:5001/api-docs`
- **Interactive Testing**: Try all API endpoints directly
- **Complete Documentation**: Detailed request/response schemas

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Payments
- `POST /api/payment/deposit` - Deposit money
- `POST /api/payment/withdraw` - Withdraw money
- `POST /api/payment/payment` - Make payment
- `POST /api/payment/transfer` - Transfer money
- `GET /api/payment/balance` - Get account balance
- `GET /api/payment/history` - Transaction history
- `GET /api/payment/stats` - Transaction statistics

#### Public Content
- `GET /api/public/about-us` - Company information
- `GET /api/public/contact-us` - Contact details
- `GET /api/public/services` - Available services
- `GET /api/public/faq` - Frequently asked questions

## 🔑 Demo Login Credentials

### Primary Demo Account
- **Email**: `john.smith@example.com`
- **Password**: `password123`
- **Account Number**: `ACC000001`
- **Balance**: $5,000.00

### Additional Demo Accounts
| Email | Password | Balance | Status |
|-------|----------|---------|---------|
| sarah.johnson@example.com | password123 | $3,500.00 | Fully Verified |
| michael.brown@example.com | password123 | $1,200.00 | Profile incomplete |
| emily.davis@example.com | password123 | $800.00 | Email Not Verified |
| david.wilson@example.com | password123 | $7,500.00 | Fully Verified |

## 🏦 Features Overview

### ✅ Implemented Features

#### User Management
- [x] User registration with email verification
- [x] Multi-step verification flow (email → profile → PIN)
- [x] JWT authentication with role-based access
- [x] Password hashing with bcrypt

#### Payment System
- [x] Deposit money with instant balance update
- [x] Withdraw money with balance validation
- [x] Transfer money between accounts
- [x] Make payments to other accounts
- [x] Transaction history with filtering
- [x] Transaction statistics and analytics

#### Database Schema
- [x] MySQL database with proper relationships
- [x] Automatic balance triggers
- [x] Account number generation
- [x] Transaction reference numbers

#### API Documentation
- [x] Complete Swagger API documentation
- [x] Interactive API testing
- [x] Request/response schemas
- [x] Authentication examples

#### Frontend Components
- [x] Responsive payment dashboard
- [x] Transaction history display
- [x] Balance overview with statistics
- [x] Modal forms for all payment operations

### 🔧 Technical Stack

#### Backend
- **Node.js** with Express.js
- **MySQL** database with mysql2 driver
- **JWT** for authentication
- **bcrypt** for password hashing
- **Swagger** for API documentation
- **Framer Motion** for animations

#### Frontend
- **React** with TypeScript
- **Axios** for API calls
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **Framer Motion** for animations

## 🧪 Testing the System

### 1. Test Registration
1. Go to `http://localhost:3000/register`
2. Fill in user details
3. Verify email (simulated)
4. Complete profile
5. Set transaction PIN

### 2. Test Login
1. Go to `http://localhost:3000/login`
2. Use demo credentials
3. Navigate to dashboard

### 3. Test Payments
1. Go to Payment Dashboard
2. Try deposit: $100
3. Try withdrawal: $50
4. Try transfer: $25 to another account
5. Check transaction history

### 4. Test API Documentation
1. Go to `http://localhost:5001/api-docs`
2. Try authentication endpoints
3. Test payment endpoints with JWT token
4. Verify public endpoints work without auth

## 🐛 Common Issues & Solutions

### Database Connection Error
```
Error: Operation `users.findOne()` buffering timed out after 10000ms
```
**Solution**: Ensure MySQL server is running and credentials are correct in `db.js`

### Module Not Found Error
```
Error: Cannot find module 'mysql2'
```
**Solution**: Install mysql2 package:
```bash
npm install mysql2
```

### CORS Error
**Solution**: Ensure frontend is running on `http://localhost:3000` and backend allows this origin

### Authentication Issues
**Solution**: Check JWT token is properly stored in localStorage and sent in headers

## 📊 Database Schema Overview

### Core Tables
- **users** - User accounts with verification status
- **transactions** - All financial transactions
- **user_profiles** - User personal information
- **user_security** - Transaction PIN data
- **loans** - Loan applications and status
- **savings_goals** - User savings goals
- **notifications** - System notifications

### Important Relationships
- Users → Transactions (1:N)
- Users → Loans (1:N)
- Users → Savings Goals (1:N)
- Users → Notifications (1:N)

## 🚀 Next Steps

### Enhancements to Consider
1. **Real-time Updates**: WebSocket integration for live balance updates
2. **Mobile App**: React Native mobile application
3. **Advanced Analytics**: Transaction analytics dashboard
4. **AI Integration**: Smart spending insights
5. **Security**: Two-factor authentication
6. **Compliance**: Regulatory reporting features

### Production Deployment
1. **Database**: Use MySQL cloud service
2. **Backend**: Deploy to cloud platform (AWS, Azure, etc.)
3. **Frontend**: Deploy to static hosting
4. **Security**: SSL certificates, environment variables
5. **Monitoring**: Logging and error tracking

## 📞 Support

### API Documentation
- **Swagger UI**: `http://localhost:5001/api-docs`
- **API Root**: `http://localhost:5001/`

### Demo Data
- **Admin Email**: `admin@aibanking.com`
- **Test Users**: See demo credentials table above

### Troubleshooting
1. Check MySQL server status
2. Verify database credentials
3. Check Node.js version compatibility
4. Review console logs for errors

---

## 🎉 Ready to Go!

Your AI Banking platform is now fully configured with:
- ✅ Complete user authentication system
- ✅ Full payment processing capabilities
- ✅ Comprehensive API documentation
- ✅ Demo data for testing
- ✅ Modern, responsive frontend
- ✅ Secure MySQL database

Start exploring the platform and enjoy building your banking application! 🏦✨
