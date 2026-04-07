const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Credentials - Migrated to environment variables for security and deployment stability
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.emails || !profile.emails.length) {
            return done(new Error("No email found from Google"), null);
        }
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (user) {
            // Link Google ID if not already linked
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        } else {
            // New user: return the profile but don't create user yet
            // The route callback will handle redirected the user to role selection
            return done(null, {
                isNewGoogleUser: true,
                profile: {
                    id: profile.id,
                    displayName: profile.displayName,
                    emails: profile.emails
                }
            });
        }
    } catch (err) {
        console.error("❌ Google Auth Error:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    if (user.isNewGoogleUser) {
        // For new users, serialize the profile temporary
        done(null, { isNew: true, profile: user.profile });
    } else {
        done(null, user.id);
    }
});

passport.deserializeUser(async (data, done) => {
    try {
        if (data.isNew) {
            done(null, data);
        } else {
            const user = await User.findById(data);
            done(null, user);
        }
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;