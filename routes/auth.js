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

// POST /auth/change-password
router.post('/change-password', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const role = req.session.user.role;
    const dashboardUrl = role === 'student' ? '/student/dashboard?tab=settings' : '/company/dashboard?tab=settings';

    try {
        if (newPassword !== confirmPassword) {
            return res.redirect(`${dashboardUrl}&error=New%20passwords%20do%20not%20match.`);
        }

        if (newPassword.length < 6) {
            return res.redirect(`${dashboardUrl}&error=New%20password%20must%20be%20at%20least%206%20characters.`);
        }

        const user = await User.findById(req.session.user.id);
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.redirect(`${dashboardUrl}&error=Invalid%20current%20password.`);
        }

        user.password = newPassword;
        await user.save();

        res.redirect(`${dashboardUrl}&success=Password%20updated%20successfully.`);
    } catch (err) {
        console.error('Change password error:', err);
        res.redirect(`${dashboardUrl}&error=Something%20went%20wrong.%20Please%20try%20again.`);
    }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
