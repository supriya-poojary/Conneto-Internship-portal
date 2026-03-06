const express = require('express');
const router = express.Router();
const path = require('path');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const bcrypt = require('bcryptjs');

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

// Premium Interior Portfolio Page
router.get('/interior', (req, res) => {
    res.render('interior', { title: 'Lumina | Luxury Interior Architecture' });
});

// Student Dashboard
router.get('/student/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'student') return res.redirect('/');

    try {
        // Get all applications for this student
        const applications = await Application.find({ student: req.session.user.id })
            .populate({
                path: 'internship',
                populate: {
                    path: 'company',
                    select: 'companyName'
                }
            })
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

        // Get student profile
        const profile = await StudentProfile.findOne({ user: req.session.user.id });

        res.render('dashboard/student', {
            title: 'Student Dashboard | Conneto',
            user: req.session.user,
            stats: {
                total: totalApplications,
                interviews: interviewCount,
                pending: pendingCount,
                hired: hiredCount
            },
            applications: applications,
            internships: featuredInternships,
            profile: profile || {},
            query: req.query
        });
    } catch (err) {
        console.error('Student dashboard error:', err);
        res.render('dashboard/student', {
            title: 'Student Dashboard | Conneto',
            user: req.session.user,
            stats: { total: 0, interviews: 0, pending: 0, hired: 0 },
            applications: [],
            internships: [],
            profile: {}
        });
    }
});

// Update Profile API
router.post('/student/profile', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { college, degree, branch, year, gpa, bio, location, phone, linkedin, github, skills } = req.body;
        const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];

        const updateData = {
            college, degree, branch, year, gpa, bio, location, phone, linkedin, github,
            skills: skillsArray,
            updatedAt: Date.now()
        };

        await StudentProfile.findOneAndUpdate(
            { user: req.session.user.id },
            { $set: updateData },
            { new: true, upsert: true }
        );
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update Settings API
router.post('/student/settings', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.user.id);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update settings' });
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
            .sort({ appliedAt: -1 })
            .lean();

        // Attach student profiles
        for (let app of applications) {
            if (app.student && app.student._id) {
                app.student.profile = await StudentProfile.findOne({ user: app.student._id }).lean() || {};
            }
        }


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
