const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/auth/login');
};

// GET /admin/dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const pendingCompanies = await User.find({ role: 'company', status: 'Pending' }, '-companyDocuments.docData').sort({ createdAt: -1 });
        const approvedCompanies = await User.find({ role: 'company', status: 'Approved' }, '-companyDocuments.docData').sort({ createdAt: -1 });
        
        res.render('admin/dashboard', { 
            title: 'Admin Dashboard — Conneto',
            pendingCompanies,
            approvedCompanies,
            user: req.session.user
        });

    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// POST /admin/approve/:id
router.post('/approve/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { 
            status: 'Approved',
            rejectionReason: null // Clear reason if previously rejected
        });
        res.redirect('/admin/dashboard?success=Company approved successfully');
    } catch (err) {
        console.error('Approve error:', err);
        res.redirect('/admin/dashboard?error=Failed to approve company');
    }
});

// POST /admin/reject/:id
router.post('/reject/:id', isAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        await User.findByIdAndUpdate(req.params.id, { 
            status: 'Rejected',
            rejectionReason: reason || 'Information provided did not meet our verification standards.'
        });
        res.redirect('/admin/dashboard?success=Company rejected with reason.');
    } catch (err) {
        console.error('Reject error:', err);
        res.redirect('/admin/dashboard?error=Failed to reject company');
    }
});

module.exports = router;
