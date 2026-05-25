require('dotenv').config();
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { JWT_SECRET } = require('./env');
const { query } = require('./db');

// JWT Strategy options
const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

// JWT Strategy - authenticate users using JWT token
passport.use(new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
    try {
        // Query user from TiDB Cloud
        const result = await query(
            `SELECT id, email, first_name, last_name, role, profile_picture 
             FROM users WHERE id = ?`,
            [jwtPayload.user?.id || jwtPayload.id]
        );
        
        const user = result.rows[0];
        
        if (user) {
            return done(null, user);
        }
        return done(null, false, { message: 'User not found or inactive' });
    } catch (err) {
        console.error('JWT Strategy error:', err.message);
        return done(err, false);
    }
}));

// Serialize user (store user ID in session if using sessions)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user (retrieve user from database)
passport.deserializeUser(async (id, done) => {
    try {
        const result = await query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
            [id]
        );
        
        const user = result.rows[0];
        done(null, user || null);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;