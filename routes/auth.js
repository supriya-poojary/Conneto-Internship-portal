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
    const { name, companyName, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('auth/register', { title: 'Register — Conneto', error: 'Email already registered.' });
        }
        // Create the user - data will be stored in MongoDB
        const user = await User.create({ name, companyName, email, password, role });

        // Auto-login after registration - create session
        req.session.user = { id: user._id, name: user.name, companyName: user.companyName, role: user.role };

        // Redirect to dashboard based on role
        if (role === 'student') return res.redirect('/student/dashboard');
        return res.redirect('/company/dashboard');
    } catch (err) {
        res.render('auth/register', { title: 'Register — Conneto', error: 'Something went wrong. Please try again.' });
    }
});

// GET /auth/login
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    const registered = req.query.registered === 'true';
    res.render('auth/login', { title: 'Login — Conneto', error: null, success: registered ? 'Account created successfully! Please sign in to continue.' : null });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', { title: 'Login — Conneto', error: 'Invalid email or password.', success: null });
        }
        req.session.user = { id: user._id, name: user.name, companyName: user.companyName, role: user.role };
        if (user.role === 'student') return res.redirect('/student/dashboard');
        return res.redirect('/company/dashboard');
    } catch (err) {
        res.render('auth/login', { title: 'Login — Conneto', error: 'Something went wrong. Please try again.', success: null });
    }
});

// GET /auth/forgot-password
router.get('/forgot-password', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/forgot-password', { title: 'Forgot Password — Conneto', error: null, success: null });
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    try {
        if (newPassword !== confirmPassword) {
            return res.render('auth/forgot-password', { title: 'Forgot Password', error: 'Passwords do not match.', success: null });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/forgot-password', { title: 'Forgot Password', error: 'No account found with that email address.', success: null });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.render('auth/login', { title: 'Login — Conneto', error: null, success: 'Password changed successfully! You can now sign in.' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.render('auth/forgot-password', { title: 'Forgot Password', error: 'Something went wrong. Please try again.', success: null });
    }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
