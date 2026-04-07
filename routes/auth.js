const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { upload } = require('../config/upload');

// GET /auth/register
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { title: 'Register — Conneto', error: null });
});

// POST /auth/register
router.post('/register', upload.any(), async (req, res) => {
    const { name, companyName, email, password, role, cin, companyAddress, phone, companyType } = req.body;
    try {
        // --- 1. Basic Field Validation ---
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.render('auth/register', { title: 'Register — Conneto', error: 'Please enter a valid work or university email.' });
        }

        if (!password || password.length < 6) {
            return res.render('auth/register', { title: 'Register — Conneto', error: 'Password is too weak. Minimum 6 characters required.' });
        }

        if (!name || name.trim().length < 2) {
            return res.render('auth/register', { title: 'Register — Conneto', error: 'Please provide your full professional name.' });
        }

        if (role === 'company') {
            const cinRegex = /^[L|U][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
            if (!cin || !cin.match(cinRegex)) {
                return res.render('auth/register', { title: 'Register — Conneto', error: 'Identification failed: Invalid 21-digit CIN format.' });
            }

            if (!phone || !phone.match(/^[0-9]{10,15}$/)) {
                return res.render('auth/register', { title: 'Register — Conneto', error: 'Please enter a valid 10-15 digit contact number.' });
            }

            if (!companyName || companyName.trim().length < 2) {
                return res.render('auth/register', { title: 'Register — Conneto', error: 'Official company name is required to proceed.' });
            }

            if (!companyAddress || companyAddress.trim().length < 10) {
                return res.render('auth/register', { title: 'Register — Conneto', error: 'Please provide a complete headquarters address.' });
            }
        }

        // --- 2. Database Integrity Check ---
        const existing = await User.findOne({ email });
        if (existing) {
            if (existing.role === 'company' && existing.status === 'Pending') {
                return res.render('auth/login', {
                    title: 'Login — Conneto',
                    error: 'Account already exists and is currently undergoing verification. Please check back later.',
                    success: null
                });
            }
            if (existing.role === 'company' && existing.status === 'Approved') {
                return res.render('auth/login', {
                    title: 'Login — Conneto',
                    error: null,
                    success: 'Your company is already verified. Please sign in directly.'
                });
            }
            return res.render('auth/register', { title: 'Register — Conneto', error: 'This email is already registered. Please sign in.' });
        }

        // --- 3. Account Creation ---
        const userData = { name, companyName, email, password, role };

        if (role === 'company') {
            userData.status = 'Pending';
            userData.cin = cin;
            userData.companyAddress = companyAddress;
            userData.phone = phone;
            userData.companyType = companyType;

            // Map uploaded files to companyDocuments model (Direct Binary Storage)
            if (req.files && req.files.length > 0) {
                userData.companyDocuments = req.files.map(file => ({
                    docName: file.fieldname,
                    docData: file.buffer,
                    contentType: file.mimetype
                }));
            }
        } else if (role === 'student') {
            userData.status = 'Approved';
        }


        const user = await User.create(userData);

        if (user.status === 'Approved') {
            req.session.user = { id: user._id, name: user.name, companyName: user.companyName, role: user.role };
            if (role === 'student') return res.redirect('/student/dashboard');
            return res.redirect('/company/dashboard');
        } else {
            return res.render('auth/login', {
                title: 'Login — Conneto',
                error: null,
                success: 'Registration successful! Your credentials have been submitted for administrator review. You will gain access once verified.'
            });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.render('auth/register', { title: 'Register — Conneto', error: 'An unexpected error occurred. Please try again later.' });
    }
});

// GET /auth/login
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    const registered = req.query.registered === 'true';
    let error = req.query.error || null;

    // Google Auth error handling
    if (req.query.auth_error === 'google') {
        error = 'Identity Verification Denied: We could not verify your Google credentials. Please ensure your account has a primary email or try traditional sign-in.';
    } else if (req.query.auth_error === 'no_user') {
        error = 'Identity Sync Error: Authentication succeeded via Google but we could not establish a session. Please try again.';
    }

    res.render('auth/login', {
        title: 'Login — Conneto',
        error: error,
        success: registered ? 'Account created successfully! Please sign in to continue.' : null
    });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', { title: 'Login — Conneto', error: 'Invalid email or password.', success: null });
        }

        // Check verification status for companies
        if (user.role === 'company' && user.status === 'Pending') {
            return res.render('auth/login', { title: 'Login — Conneto', error: 'Your account is still pending approval by the administrator.', success: null });
        }
        if (user.role === 'company' && user.status === 'Rejected') {
            const msg = `Application Declined: ${user.rejectionReason || 'Please contact support for clarification.'}`;
            return res.render('auth/login', { title: 'Login — Conneto', error: msg, success: null });
        }

        req.session.user = { id: user._id, name: user.name, companyName: user.companyName, role: user.role };

        if (user.role === 'student') return res.redirect('/student/dashboard');
        if (user.role === 'admin') return res.redirect('/admin/dashboard');
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

// GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /auth/google/callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login?auth_error=google' }),
    async (req, res) => {
        // Successful authentication
        if (!req.user) return res.redirect('/auth/login?auth_error=no_user');

        // Enforcement: Ensure approved companies can login, others are blocked
        if (req.user.role === 'company') {
            if (req.user.status === 'Pending') {
                req.logout(() => {}); // Logout from passport session
                return res.render('auth/login', { 
                    title: 'Login — Conneto', 
                    error: 'Authentication successful, but your company account is still awaiting administrator approval.', 
                    success: null 
                });
            }
            if (req.user.status === 'Rejected') {
                req.logout(() => {});
                const msg = `Access Denied: ${req.user.rejectionReason || 'Your application was not approved.'}`;
                return res.render('auth/login', { title: 'Login — Conneto', error: msg, success: null });
            }
        }

        req.session.user = {
            id: req.user._id,
            name: req.user.name,
            companyName: req.user.companyName,
            role: req.user.role
        };

        console.log('Google login sync successful for:', req.user.email);

        if (req.user.role === 'student') return res.redirect('/student/dashboard');
        if (req.user.role === 'admin') return res.redirect('/admin/dashboard');
        return res.redirect('/company/dashboard');
    }
);

module.exports = router;
