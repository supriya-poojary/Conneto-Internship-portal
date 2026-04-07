require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // Import passport configuration
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// Trust proxy for secure cookies/OAuth redirects on hosting platforms
app.set('trust proxy', 1);

// ─── Connect to MongoDB Atlas ──────────────────────────────────────────────
let dbConnected = false;
const mongodb_uri = process.env.MONGODB_URI || 'mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster';
mongoose.connect(mongodb_uri)
    .then(() => { console.log('✅ Connected to MongoDB Atlas'); dbConnected = true; })
    .catch(err => console.error('⚠️  MongoDB unavailable:', err.message));

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Sessions ─────────────────────────────────────────────────────────────
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'conneto_premium_portal_secure_vault_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false, // Set to true if using HTTPS
        sameSite: 'lax'
    }
};
if (mongodb_uri) {
    sessionConfig.store = MongoStore.create({ mongoUrl: mongodb_uri });
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());


// ─── View Engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/leaves', require('./routes/leaves'));
app.use('/', require('./routes/internships'));
app.use('/admin', require('./routes/admin'));


// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

// ─── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Conneto server running at http://localhost:${PORT}`);
});

module.exports = app;
