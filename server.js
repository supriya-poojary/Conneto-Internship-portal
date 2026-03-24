const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Connect to MongoDB Atlas ──────────────────────────────────────────────
let dbConnected = false;
const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";
const mongodb_uri = process.env.MONGODB_URI || MONGODB_URI;
if (mongodb_uri && !mongodb_uri.includes('<username>') && !mongodb_uri.includes('xxxxx')) {
    mongoose.connect(mongodb_uri)
        .then(() => { console.log('✅ Connected to MongoDB Atlas'); dbConnected = true; })
        .catch(err => console.error('⚠️  MongoDB unavailable (frontend-only mode):', err.message));
} else {
    console.log('⚠️  MongoDB URI not configured. Running in frontend-only mode.');
}

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Sessions ─────────────────────────────────────────────────────────────
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
};
// Only use MongoStore if a real URI is provided
const mongoUri = process.env.MONGODB_URI || '';
if (mongoUri && !mongoUri.includes('<username>') && !mongoUri.includes('xxxxx')) {
    sessionConfig.store = MongoStore.create({ mongoUrl: mongoUri });
}
app.use(session(sessionConfig));

// ─── View Engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
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
