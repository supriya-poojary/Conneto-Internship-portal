const express = require('express');
const router = express.Router();
const path = require('path');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

// Project root directory
const ROOT = path.resolve(__dirname, '..');

// Home page
router.get('/', async (req, res) => {
    try {
        const internships = await Internship.find({ isActive: true }).limit(6).sort({ createdAt: -1 });
        res.render('index', {
            title: 'Conneto — Find Your Internship',
            user: req.session.user || null,
            internships: internships
        });
    } catch (err) {
        console.error('Home route error:', err);
        res.render('index', {
            title: 'Conneto — Find Your Internship',
            user: req.session.user || null,
            internships: []
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us | Conneto', user: req.session.user || null });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us | Conneto', user: req.session.user || null });
});

// Student Dashboard (Unified)
router.get('/student/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'student') return res.redirect('/');

    const activeTab = req.query.tab || 'dashboard';

    try {
        const applications = await Application.find({ student: req.session.user.id })
            .populate('internship')
            .sort({ appliedAt: -1 });

        const stats = {
            total: applications.length,
            interviews: applications.filter(app => ['interview_scheduled', 'shortlisted'].includes(app.status)).length,
            pending: applications.filter(app => ['applied', 'under_review'].includes(app.status)).length,
            hired: applications.filter(app => app.status === 'selected').length
        };

        const limit = activeTab === 'browse' ? 20 : 5;
        const internships = await Internship.find({ isActive: true })
            .populate('company', 'companyName name')
            .sort({ createdAt: -1 })
            .limit(limit);

        const profile = await StudentProfile.findOne({ user: req.session.user.id });

        let pageTitle = 'Student Dashboard | Conneto';
        if (activeTab === 'profile') pageTitle = 'My Portfolio | Conneto';
        if (activeTab === 'browse') pageTitle = 'Explore Internships | Conneto';
        if (activeTab === 'applications') pageTitle = 'My Applications | Conneto';

        res.render('dashboard/student', {
            title: pageTitle,
            user: req.session.user,
            activePage: activeTab,
            stats,
            internships,
            applications,
            profile: profile || {},
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error('Unified dashboard error:', err);
        res.redirect('/');
    }
});

// Redirect legacy student routes to the new unified dashboard
router.get('/student/profile', (req, res) => res.redirect('/student/dashboard?tab=profile'));
router.get('/student/applications', (req, res) => res.redirect('/student/dashboard?tab=applications'));
router.get('/student/saved', (req, res) => res.redirect('/student/dashboard?tab=saved'));

// Company Dashboard (Unified)
router.get('/company/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (req.session.user.role !== 'company') return res.redirect('/');

    const activeTab = req.query.tab || 'dashboard';

    try {
        const myInternships = await Internship.find({ company: req.session.user.id });
        const applications = await Application.find({
            internship: { $in: myInternships.map(i => i._id) }
        })
            .populate('student', 'name email phone')
            .populate('internship')
            .sort({ appliedAt: -1 });

        // NEW: Fetch profiles for each student in the pipeline
        const studentIds = applications.map(app => app.student._id);
        const profiles = await StudentProfile.find({ user: { $in: studentIds } });

        // Attach profile to each application object
        applications.forEach(app => {
            app.profile = profiles.find(p => p.user.toString() === app.student._id.toString()) || {};
        });

        // Calculate stats for Each Internship (for the management tab)
        const internshipsWithStats = myInternships.map(int => {
            const intApps = applications.filter(a => a.internship && a.internship._id.toString() === int._id.toString());
            return {
                ...int.toObject(),
                stats: {
                    total: intApps.length,
                    selected: intApps.filter(a => a.status === 'selected').length
                }
            };
        });

        // Group applications by internship for the 'Applications' tab
        const grouped = {};
        myInternships.forEach(int => {
            grouped[int._id] = { internship: int, applications: [] };
        });
        applications.forEach(app => {
            if (app.internship && grouped[app.internship._id]) {
                grouped[app.internship._id].applications.push(app);
            }
        });

        res.render('dashboard/company', {
            title: 'Company Dashboard | Conneto',
            user: req.session.user,
            activePage: activeTab,
            stats: {
                active: myInternships.filter(i => i.isActive).length,
                totalApplicants: applications.length,
                interviews: applications.filter(app => ['interview_scheduled', 'shortlisted'].includes(app.status)).length,
                hired: applications.filter(app => app.status === 'selected').length
            },
            applicants: applications.slice(0, 10),
            myInternships: internshipsWithStats,
            groupedApplications: Object.values(grouped),
            totalApplications: applications.length,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error('Company unified error:', err);
        res.redirect('/');
    }
});

// Redirect legacy company routes
router.get('/company/applications', (req, res) => res.redirect('/company/dashboard?tab=applications'));
router.get('/company/profile', (req, res) => res.redirect('/company/dashboard?tab=profile'));
router.get('/company/internships', (req, res) => res.redirect('/company/dashboard?tab=internships'));

// POST /student/profile/update
router.post('/student/profile/update', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.redirect('/auth/login');

    try {
        const {
            name, email, dob, gender, usn, college, degree, department, semester, year, gpa,
            address, city, state, country, bio, experience, projects, skills, interests,
            certifications, languages, phone, linkedin, github, portfolio
        } = req.body;

        // 1. Update Core User (Name/Email)
        if (req.session.user.id) {
            const userUpd = {};
            if (name) userUpd.name = name;
            if (email) userUpd.email = email;
            if (Object.keys(userUpd).length > 0) {
                await User.findByIdAndUpdate(req.session.user.id, userUpd);
                if (name) req.session.user.name = name;
                if (email) req.session.user.email = email;
            }
        }

        // 2. Track 25 Key Fields (4% each)
        let filledCount = 0;
        const check = (val) => (val && val.toString().trim().length > 0);

        [name, email, dob, gender, usn, college, degree, department, semester, year, gpa,
            address, city, state, country, bio, experience, projects, skills, interests,
            certifications, languages, phone, linkedin, github, portfolio].forEach(f => {
                if (check(f)) filledCount++;
            });

        const strength = Math.min(filledCount * 4, 100);

        // 3. Update Profile Data
        const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const interestsArr = interests ? interests.split(',').map(s => s.trim()).filter(s => s) : [];

        await StudentProfile.findOneAndUpdate(
            { user: req.session.user.id },
            {
                dob, gender, usn, college, degree, department, semester, year, gpa,
                address, city, state, country, bio, experience, projects,
                certifications, languages,
                skills: skillsArr,
                interests: interestsArr,
                phone, linkedin, github, portfolio,
                completionPercentage: strength,
                updatedAt: Date.now()
            },
            { upsert: true, new: true }
        );

        res.redirect('/student/dashboard?tab=profile&success=1');
    } catch (err) {
        console.error('Portfolio Save Error:', err);
        res.redirect('/student/dashboard?tab=profile&error=1');
    }
});

module.exports = router;
