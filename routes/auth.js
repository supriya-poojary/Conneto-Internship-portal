const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /auth/register
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { title: 'Register — Conneto', error: null });
});

// POST /auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('auth/register', { title: 'Register — Conneto', error: 'Email already registered.' });
        }
        const user = await User.create({ name, email, password, role });
        req.session.user = { id: user._id, name: user.name, role: user.role };
        if (role === 'student') return res.redirect('/student/dashboard');
        return res.redirect('/company/dashboard');
    } catch (err) {
        res.render('auth/register', { title: 'Register — Conneto', error: 'Something went wrong. Please try again.' });
    }
});

// GET /auth/login
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { title: 'Login — Conneto', error: null });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', { title: 'Login — Conneto', error: 'Invalid email or password.' });
        }
        req.session.user = { id: user._id, name: user.name, role: user.role };
        if (user.role === 'student') return res.redirect('/student/dashboard');
        return res.redirect('/company/dashboard');
    } catch (err) {
        res.render('auth/login', { title: 'Login — Conneto', error: 'Something went wrong. Please try again.' });
    }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
