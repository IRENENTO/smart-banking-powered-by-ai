const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Backend payment and transaction API tests', () => {
    let token;
    let recipientAccountNumber;
    const sender = {
        name: `API Tester ${Date.now()}`,
        email: `api-sender-${Date.now()}@example.com`,
        phone: `+2507700${Math.floor(100000 + Math.random() * 900000)}`,
        password: 'Password123!'
    };
    const recipient = {
        name: `API Recipient ${Date.now()}`,
        email: `api-recipient-${Date.now()}@example.com`,
        phone: `+2507700${Math.floor(100000 + Math.random() * 900000)}`,
        password: 'Password123!'
    };

    beforeAll(async () => {
        const senderRegister = await request(app)
            .post('/api/auth/register')
            .send(sender);
        expect(senderRegister.statusCode).toBe(201);

        const recipientRegister = await request(app)
            .post('/api/auth/register')
            .send(recipient);
        expect(recipientRegister.statusCode).toBe(201);

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: sender.email, password: sender.password });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
        token = loginResponse.body.token;

        const foundRecipient = await User.findByEmail(recipient.email);
        expect(foundRecipient).toBeTruthy();
        recipientAccountNumber = foundRecipient.account_number;
        expect(recipientAccountNumber).toBeDefined();
    }, 20000);

    test('deposit endpoint should create a deposit transaction', async () => {
        const response = await request(app)
            .post('/api/payment/deposit')
            .set('x-auth-token', token)
            .send({ amount: 250.50, description: 'Test deposit' });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('msg', 'Deposit successful');
        expect(response.body).toHaveProperty('transaction');
        expect(response.body).toHaveProperty('new_balance', 250.5);
        expect(response.body.transaction.type).not.toBeUndefined();
    });

    test('withdraw endpoint should create a withdrawal transaction', async () => {
        const response = await request(app)
            .post('/api/payment/withdraw')
            .set('x-auth-token', token)
            .send({ amount: 50.25, description: 'Test withdrawal' });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('msg', 'Withdrawal successful');
        expect(response.body).toHaveProperty('transaction');
        expect(response.body.new_balance).toBeCloseTo(200.25, 2);
    });

    test('payment endpoint should transfer funds to another internal account', async () => {
        const response = await request(app)
            .post('/api/payment/payment')
            .set('x-auth-token', token)
            .send({
                amount: 20.00,
                recipient_account_number: recipientAccountNumber,
                description: 'API payment'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('msg', 'Payment successful');
        expect(response.body.transaction.recipient_account_number).toBe(recipientAccountNumber);
    });

    test('transaction history should return recent transactions', async () => {
        const response = await request(app)
            .get('/api/payment/history')
            .set('x-auth-token', token);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.transactions)).toBe(true);
        expect(response.body.transactions.length).toBeGreaterThanOrEqual(1);
    });

    test('transactions balance endpoint should return current user balance', async () => {
        const response = await request(app)
            .get('/api/transactions/balance')
            .set('x-auth-token', token);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('balance');
        expect(response.body).toHaveProperty('account_number');
    });
});
