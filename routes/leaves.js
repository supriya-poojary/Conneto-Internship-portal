const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Application = require('../models/Application');
const DiaryEntry = require('../models/DiaryEntry');
const { isAuthenticated, isRole } = require('../middleware/auth');

const getCompanyDashboardRedirect = (req, fallback) => {
    const candidate = req.body.redirectTo || req.get('Referrer');
    if (candidate) {
        try {
            if (candidate.startsWith('/company/dashboard')) {
                return candidate;
            }
            const parsed = new URL(candidate, 'http://localhost');
            const pathWithQuery = `${parsed.pathname}${parsed.search || ''}`;
            if (pathWithQuery.startsWith('/company/dashboard')) {
                return pathWithQuery;
            }
        } catch (err) {
            if (candidate.startsWith('/company/dashboard')) {
                return candidate;
            }
        }
    }
    return fallback;
};

// POST /leaves/apply
router.post('/apply', isAuthenticated, isRole(['student']), async (req, res) => {
    const { internshipId, startDate, endDate, reason } = req.body;
    try {
        const leave = await Leave.create({
            student: req.session.user.id,
            internship: internshipId,
            startDate,
            endDate,
            reason
        });
        res.redirect('/student/dashboard?tab=leaves&success=Leave application submitted.');
    } catch (err) {
        console.error(err);
        res.redirect('/student/dashboard?tab=leaves&error=Failed to submit leave.');
    }
});

// POST /leaves/approve/:id
router.post('/approve/:id', isAuthenticated, isRole(['company', 'admin']), async (req, res) => {
    const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=leaves');
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Leave not found`);
        
        leave.status = 'Approved';
        leave.approvedBy = req.session.user.id;
        await leave.save();
        
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}success=Leave approved`);
    } catch (err) {
        console.error(err);
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Failed to approve leave`);
    }
});

// POST /leaves/reject/:id
router.post('/reject/:id', isAuthenticated, isRole(['company', 'admin']), async (req, res) => {
    const { remarks } = req.body;
    const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=leaves');
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Leave not found`);
        
        leave.status = 'Rejected';
        leave.remarks = remarks || 'Not approved by company';
        leave.approvedBy = req.session.user.id;
        await leave.save();
        
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}success=Leave rejected`);
    } catch (err) {
        console.error(err);
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Failed to reject leave`);
    }
});

module.exports = router;
