const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { JWT_SECRET } = require('./env');
const User = require('../models/User');

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.user.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback'
            },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ 'oauth.google.id': profile.id });

                if (user) {
                    user.oauth.google.accessToken = accessToken;
                    await user.save();
                    return done(null, user);
                }

                let existingUser = await User.findOne({ email: profile.emails[0].value });

                if (existingUser) {
                    existingUser.oauth.google = {
                        id: profile.id,
                        accessToken: accessToken
                    };
                    await existingUser.save();
                    return done(null, existingUser);
                }

                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    oauth: {
                        google: {
                            id: profile.id,
                            accessToken: accessToken
                        }
                    }
                });

                await user.save();
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);
}

// Only configure Facebook OAuth if credentials are available
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: '/api/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'photos', 'email']
            },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ 'oauth.facebook.id': profile.id });

                if (user) {
                    user.oauth.facebook.accessToken = accessToken;
                    await user.save();
                    return done(null, user);
                }

                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                let existingUser = email ? await User.findOne({ email }) : null;

                if (existingUser) {
                    existingUser.oauth.facebook = {
                        id: profile.id,
                        accessToken: accessToken
                    };
                    await existingUser.save();
                    return done(null, existingUser);
                }

                user = new User({
                    name: profile.displayName,
                    email: email || `fb_${profile.id}@bankingx.local`,
                    profilePicture: profile.photos[0].value,
                    oauth: {
                        facebook: {
                            id: profile.id,
                            accessToken: accessToken
                        }
                    }
                });

                await user.save();
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);
}

// Only configure Twitter OAuth if credentials are available
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(
        new TwitterStrategy(
            {
                consumerKey: process.env.TWITTER_CONSUMER_KEY,
                consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
                callbackURL: '/api/auth/twitter/callback',
                includeEmail: true
            },
        async (token, tokenSecret, profile, done) => {
            try {
                let user = await User.findOne({ 'oauth.twitter.id': profile.id });

                if (user) {
                    user.oauth.twitter.accessToken = token;
                    user.oauth.twitter.refreshToken = tokenSecret;
                    await user.save();
                    return done(null, user);
                }

                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                let existingUser = email ? await User.findOne({ email }) : null;

                if (existingUser) {
                    existingUser.oauth.twitter = {
                        id: profile.id,
                        accessToken: token,
                        refreshToken: tokenSecret
                    };
                    await existingUser.save();
                    return done(null, existingUser);
                }

                user = new User({
                    name: profile.displayName,
                    email: email || `tw_${profile.id}@bankingx.local`,
                    profilePicture: profile.photos[0].value,
                    oauth: {
                        twitter: {
                            id: profile.id,
                            accessToken: token,
                            refreshToken: tokenSecret
                        }
                    }
                });

                await user.save();
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);
}

module.exports = passport;
