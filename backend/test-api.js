const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'supersecretkey';
console.log('JWT_SECRET:', secret);

// Generate test admin token
const token = jwt.sign(
    { admin: { id: 1, email: 'smartbankingpoweredbyai@gmail.com', role: 'super_admin' } },
    secret,
    { expiresIn: '24h' }
);

async function test() {
    for (const endpoint of ['/api/admin/users', '/api/admin/transactions', '/api/admin/loans', '/api/admin/fraud-alerts', '/api/admin/stats']) {
        try {
            const res = await axios.get('http://localhost:5001' + endpoint + '?limit=5', {
                headers: { Authorization: 'Bearer ' + token }
            });
            console.log(endpoint, '->', res.status, 'OK');
        } catch(e) {
            console.log(endpoint, '->', e.response?.status, 'ERROR:', JSON.stringify(e.response?.data));
        }
    }
}
test();
