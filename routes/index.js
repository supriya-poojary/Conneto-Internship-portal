const express = require('express');
const router = express.Router();
const path = require('path');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');

// Project root directory
const ROOT = path.resolve(__dirname, '..');

// Home page
router.get('/', (req, res) => {
    res.render('index', { title: 'Conneto — Find Your Internship', user: req.session.user || null });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us | Conneto', user: req.session.user || null });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us | Conneto', user: req.session.user || null });
});

// Student Dashboard
router.get('/student/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'student') return res.redirect('/');

    try {
        // Get all applications for this student
        const applications = await Application.find({ student: req.session.user.id })
            .populate('internship')
            .sort({ appliedAt: -1 });

        const totalApplications = applications.length;
        const interviewCount = applications.filter(app =>
            ['interview_scheduled', 'shortlisted'].includes(app.status)
        ).length;
        const pendingCount = applications.filter(app =>
            ['applied', 'under_review'].includes(app.status)
        ).length;
        const hiredCount = applications.filter(app =>
            app.status === 'selected'
        ).length;

        // Get available internships to feature
        const featuredInternships = await Internship.find({
            isActive: true,
            $or: [
                { deadline: { $gte: new Date() } },
                { deadline: { $exists: false } },
                { deadline: null }
            ]
        })
            .populate('company', 'companyName')
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('dashboard/student', {
            title: 'Student Dashboard | Conneto',
            user: req.session.user,
            stats: {
                total: totalApplications,
                interviews: interviewCount,
                pending: pendingCount,
                hired: hiredCount
            },
            internships: featuredInternships
        });
    } catch (err) {
        console.error('Student dashboard error:', err);
        res.render('dashboard/student', {
            title: 'Student Dashboard | Conneto',
            user: req.session.user,
            stats: { total: 0, interviews: 0, pending: 0 },
            internships: [],
            myInternships: []
        });
    }
});

// Company Dashboard
router.get('/company/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'company') return res.redirect('/');

    try {
        // Get all internships posted by this company
        const internships = await Internship.find({ company: req.session.user.id });
        const internshipIds = internships.map(i => i._id);

        const activeInternships = internships.filter(i => i.isActive === true).length;

        // Get all applications for company's internships
        const applications = await Application.find({
            internship: { $in: internshipIds }
        })
            .populate('student', 'name email phone') // Populate student info
            .populate({
                path: 'internship',
                select: 'title location stipend duration' // Specific fields from internship
            })
            .sort({ appliedAt: -1 });

        const totalApplicants = applications.length;
        const interviewCount = applications.filter(app =>
            ['interview_scheduled', 'shortlisted'].includes(app.status)
        ).length;
        const hiredCount = applications.filter(app => app.status === 'selected').length;

        // Get recent applicants (limit to 5)
        const recentApplicants = applications.slice(0, 5);

        res.render('dashboard/company', {
            title: 'Company Dashboard | Conneto',
            user: req.session.user,
            stats: {
                active: activeInternships,
                totalApplicants: totalApplicants,
                interviews: interviewCount,
                hired: hiredCount
            },
            applicants: recentApplicants,
            totalApplications: applications.length,
            myInternships: internships
        });
    } catch (err) {
        console.error('Company dashboard error:', err);
        res.render('dashboard/company', {
            title: 'Company Dashboard | Conneto',
            user: req.session.user,
            stats: { active: 0, totalApplicants: 0, interviews: 0, hired: 0 },
            applicants: [],
            totalApplications: 0,
            myInternships: []
        });
    }
});

module.exports = router;
