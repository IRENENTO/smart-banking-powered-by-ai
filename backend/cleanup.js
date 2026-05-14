const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const cleanupUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
        
        const result = await User.deleteOne({ email });
        if (result.deletedCount > 0) {
            console.log(`User with email ${email} deleted successfully.`);
        } else {
            console.log(`No user found with email ${email}.`);
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email: node cleanup.js <email>');
    process.exit(1);
}

cleanupUser(email);
