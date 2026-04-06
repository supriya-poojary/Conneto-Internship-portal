const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Application = require('../models/Application');
const DiaryEntry = require('../models/DiaryEntry');
const { isAuthenticated, isRole } = require('../middleware/auth');

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
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).send('Leave not found');
        
        leave.status = 'Approved';
        leave.approvedBy = req.session.user.id;
        await leave.save();
        
        res.redirect(req.get('Referrer') || '/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /leaves/reject/:id
router.post('/reject/:id', isAuthenticated, isRole(['company', 'admin']), async (req, res) => {
    const { remarks } = req.body;
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).send('Leave not found');
        
        leave.status = 'Rejected';
        leave.remarks = remarks || 'Not approved by company';
        leave.approvedBy = req.session.user.id;
        await leave.save();
        
        res.redirect(req.get('Referrer') || '/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
