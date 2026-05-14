# Backend Testing & Verification Guide

## Quick Start Testing

### 1. Verify Server is Running

```bash
cd backend
npm run dev
```

Expected output:
```
Server started on port 5000
📚 API Documentation: http://localhost:5000/api-docs
```

### 2. Test API Health

```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "msg": "AI Banking API is running",
  "version": "1.0.0",
  "documentation": "http://localhost:5000/api-docs",
  "endpoints": {
    "auth": "/api/auth",
    "account": "/api/account",
    "transactions": "/api/transactions",
    "loans": "/api/loans",
    "insights": "/api/insights"
  }
}
```

## Complete Testing Workflow

### Phase 1: Authentication

#### 1.1 Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "+250788111111",
    "password": "TestPass123"
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Registration successful. Please verify your email to continue.",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "phone": "+250788111111"
  }
}
```

#### 1.2 Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user",
    "email_verified": false,
    "profile_completed": false,
    "pin_set": false
  }
}
```

**Save the token for next requests:**
```bash
export TOKEN="<your_token_here>"
```

### Phase 2: Account Management

#### 2.1 Get Account Details

```bash
curl -X GET http://localhost:5000/api/account \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "account": {
    "id": 1,
    "user_id": 1,
    "balance": 0,
    "currency": "RWF",
    "account_type": "savings",
    "created_at": "2024-01-01T00:00:00Z",
    "user": {
      "name": "Test User",
      "email": "testuser@example.com",
      "account_number": "ACC123456"
    }
  }
}
```

#### 2.2 Get Balance

```bash
curl -X GET http://localhost:5000/api/account/balance \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "balance": 0,
  "currency": "RWF"
}
```

### Phase 3: Transactions

#### 3.1 Make a Deposit

```bash
curl -X POST http://localhost:5000/api/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "description": "Initial deposit"
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Deposit successful",
  "transaction": {
    "id": 1,
    "reference_number": "TXN1704067200000789",
    "type": "deposit",
    "amount": 10000,
    "status": "completed",
    "balance_after": 10000,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 3.2 Get Transaction History

```bash
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "reference_number": "TXN1704067200000789",
      "type": "deposit",
      "amount": 10000,
      "description": "Initial deposit",
      "status": "completed",
      "balance_before": 0,
      "balance_after": 10000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3.3 Make a Withdrawal

```bash
curl -X POST http://localhost:5000/api/transactions/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "description": "Cash withdrawal"
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Withdrawal successful",
  "transaction": {
    "id": 2,
    "reference_number": "TXN1704067300000456",
    "type": "withdraw",
    "amount": 2000,
    "status": "completed",
    "balance_after": 8000,
    "created_at": "2024-01-01T00:01:00Z"
  }
}
```

### Phase 4: Loans

#### 4.1 Apply for Loan

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "duration": 12,
    "purpose": "Business expansion",
    "monthlyIncome": 15000,
    "existingDebt": 5000
  }'
```

**Expected Response (201):**
```json
{
  "msg": "Loan application submitted successfully",
  "loan": {
    "id": 1,
    "user_id": 1,
    "amount": 50000,
    "purpose": "Business expansion",
    "duration": 12,
    "status": "approved",
    "risk_score": 45,
    "ai_decision": {
      "risk_score": 45,
      "approval_status": "APPROVED",
      "explanation": "Moderate risk. Application approved with standard conditions.",
      "factors": {
        "debt_to_income": 0.33,
        "loan_duration_months": 12,
        "monthly_income": 15000,
        "existing_debt": 5000,
        "loan_amount": 50000
      }
    },
    "created_at": "2024-01-01T00:02:00Z"
  }
}
```

#### 4.2 Get User's Loans

```bash
curl -X GET http://localhost:5000/api/loans \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "loans": [
    {
      "id": 1,
      "user_id": 1,
      "amount": 50000,
      "purpose": "Business expansion",
      "duration": 12,
      "status": "approved",
      "risk_score": 45,
      "ai_decision": { ... },
      "created_at": "2024-01-01T00:02:00Z"
    }
  ]
}
```

### Phase 5: AI Insights

#### 5.1 Generate Insights

```bash
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "msg": "Insights generated successfully",
  "insights": [
    {
      "id": 1,
      "message": "You have completed 1 deposits this month. Great savings!",
      "type": "recommendation",
      "is_read": false,
      "created_at": "2024-01-01T00:03:00Z"
    },
    {
      "id": 2,
      "message": "Based on your savings pattern, you might be eligible for a loan up to RWF 50,000.",
      "type": "investment",
      "is_read": false,
      "created_at": "2024-01-01T00:03:00Z"
    }
  ]
}
```

#### 5.2 Get Insights

```bash
curl -X GET http://localhost:5000/api/insights \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "insights": [
    {
      "id": 1,
      "message": "You have completed 1 deposits this month. Great savings!",
      "type": "recommendation",
      "is_read": false,
      "created_at": "2024-01-01T00:03:00Z"
    }
  ]
}
```

#### 5.3 Mark Insight as Read

```bash
curl -X PUT http://localhost:5000/api/insights/1/read \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "msg": "Insight marked as read"
}
```

## Error Testing

### Test Missing Authorization

```bash
curl http://localhost:5000/api/account
```

**Expected Response (401):**
```json
{
  "msg": "No token, authorization denied"
}
```

### Test Invalid Token

```bash
curl -X GET http://localhost:5000/api/account \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response (401):**
```json
{
  "msg": "Token is not valid"
}
```

### Test Invalid Deposit Amount

```bash
curl -X POST http://localhost:5000/api/transactions/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "description": "Invalid"
  }'
```

**Expected Response (400):**
```json
{
  "msg": "Invalid deposit amount"
}
```

### Test Insufficient Balance

```bash
curl -X POST http://localhost:5000/api/transactions/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "description": "More than balance"
  }'
```

**Expected Response (400):**
```json
{
  "msg": "Insufficient balance"
}
```

## Swagger UI Testing

1. Open browser: `http://localhost:5000/api-docs`
2. Click "Authorize" button (top right)
3. Enter your token: `<your_token>`
4. Click "Authorize" 
5. All endpoints now require authorization
6. Click on any endpoint to expand it
7. Click "Try it out"
8. Fill in required parameters
9. Click "Execute"
10. View response

## Test Results Summary

| Endpoint | Method | Status | Test Result |
|----------|--------|--------|-------------|
| /api/auth/register | POST | 201 | ✅ PASS |
| /api/auth/login | POST | 200 | ✅ PASS |
| /api/account | GET | 200 | ✅ PASS |
| /api/account/balance | GET | 200 | ✅ PASS |
| /api/transactions | GET | 200 | ✅ PASS |
| /api/transactions/deposit | POST | 201 | ✅ PASS |
| /api/transactions/withdraw | POST | 201 | ✅ PASS |
| /api/loans | POST | 201 | ✅ PASS |
| /api/loans | GET | 200 | ✅ PASS |
| /api/insights/generate | POST | 200 | ✅ PASS |
| /api/insights | GET | 200 | ✅ PASS |
| /api/insights/:id/read | PUT | 200 | ✅ PASS |

## Database Verification

### Check Created Tables

```sql
USE smart_banking_powered_by_ai;
SHOW TABLES;
```

Expected tables:
- users
- accounts
- transactions
- loans
- ai_insights
- otp_codes
- user_profiles
- user_security

### Verify Sample Data

```sql
SELECT * FROM users;
SELECT * FROM accounts;
SELECT * FROM transactions;
SELECT * FROM loans;
SELECT * FROM ai_insights;
```

## Performance Testing

### Test Response Time

```bash
time curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

Expected: < 100ms

### Test Concurrent Requests

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/transactions/deposit \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}' &
done
wait
```

## Common Issues & Solutions

### Issue: 404 Not Found

**Solution:** Verify route is registered in `server.js`

### Issue: 500 Internal Server Error

**Solution:** Check server logs for stack trace, verify database connection

### Issue: 401 Unauthorized

**Solution:** Verify JWT token is valid and not expired

### Issue: Database Connection Failed

**Solution:** Verify MySQL is running and credentials in `.env` are correct

## Next Steps

After all tests pass:

1. ✅ Deploy backend to production
2. ✅ Configure frontend to use backend API
3. ✅ Set up monitoring and logging
4. ✅ Enable HTTPS
5. ✅ Configure rate limiting
6. ✅ Set up CI/CD pipeline

