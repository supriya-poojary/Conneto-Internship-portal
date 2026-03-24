const express = require('express');
const router = express.Router();
const path = require('path');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const DiaryEntry = require('../models/DiaryEntry');

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
            .populate({
                path: 'internship',
                populate: { path: 'company', select: 'companyName name' }
            })
            .sort({ appliedAt: -1 });

        const stats = {
            total: applications.length,
            interviews: applications.filter(app => ['interview_scheduled', 'shortlisted'].includes(app.status)).length,
            pending: applications.filter(app => ['applied', 'under_review'].includes(app.status)).length,
            hired: applications.filter(app => app.status === 'selected').length
        };

        const profile = await StudentProfile.findOne({ user: req.session.user.id });

        let diaryEntries = [];
        let selectedInternships = [];
        let viewInternshipId = req.query.viewInternshipId || null;
        if (activeTab === 'diary' || activeTab === 'diary_history' || activeTab === 'dashboard') {
            selectedInternships = applications.filter(app => app.status === 'selected');
            let dFilter = { student: req.session.user.id };
            if (viewInternshipId) dFilter.internship = viewInternshipId;
            let query = DiaryEntry.find(dFilter)
                .populate({
                    path: 'internship',
                    populate: { path: 'company', select: 'companyName name' }
                })
                .sort({ date: -1 });
            if (activeTab === 'diary' || activeTab === 'dashboard') {
                query = query.limit(20);
            }
            diaryEntries = await query;
        }

        const limit = activeTab === 'browse' ? 20 : 5;
        const internships = await Internship.find({ isActive: true })
            .populate('company', 'companyName name')
            .sort({ createdAt: -1 })
            .limit(limit);

        let pageTitle = 'Student Dashboard | Conneto';
        if (activeTab === 'profile') pageTitle = 'My Portfolio | Conneto';
        if (activeTab === 'browse') pageTitle = 'Explore Internships | Conneto';
        if (activeTab === 'applications') pageTitle = 'My Applications | Conneto';
        if (activeTab === 'diary') pageTitle = 'Log Diary | Conneto';
        if (activeTab === 'diary_history') pageTitle = 'Diary Tracking | Conneto';

        res.render('dashboard/student', {
            title: pageTitle,
            user: req.session.user,
            activePage: activeTab,
            stats,
            internships,
            applications,
            selectedInternships,
            diaryEntries,
            viewInternshipId,
            profile: profile || {},
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error('Unified dashboard error:', err);
        res.redirect('/');
    }
});

// Diary Operations
router.post('/student/diary/add', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.status(403).send('Forbidden');
    try {
        const { internshipId, date, hoursWorked, workSummary, links, learnings, blockers, skillsUsed } = req.body;
        const d = new Date(date);
        if (d.getDay() === 0) return res.redirect('/student/dashboard?tab=diary&error=Entries are not permitted on Sundays');
        
        await DiaryEntry.create({
            student: req.session.user.id,
            internship: internshipId,
            date: d,
            hoursWorked, workSummary, links, learnings, blockers, skillsUsed
        });
        res.redirect(`/student/dashboard?tab=diary&viewInternshipId=${internshipId}&success=Entry added`);
    } catch (err) {
        console.error('Diary Error:', err);
        res.redirect('/student/dashboard?tab=diary&error=Failed to add entry. Date tracking must be unique.');
    }
});

router.post('/student/diary/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.status(403).send('Forbidden');
    try {
        const { date, hoursWorked, workSummary, links, learnings, blockers, skillsUsed } = req.body;
        const d = new Date(date);
        if (d.getDay() === 0) return res.redirect('/student/dashboard?tab=diary&error=Cannot set entry to Sunday');

        await DiaryEntry.findOneAndUpdate(
            { _id: req.params.id, student: req.session.user.id },
            { date: d, hoursWorked, workSummary, links, learnings, blockers, skillsUsed, updatedAt: Date.now() }
        );
        res.redirect('/student/dashboard?tab=diary_history&success=Entry updated');
    } catch (err) {
        res.redirect('/student/dashboard?tab=diary_history&error=Update failed');
    }
});

router.post('/student/diary/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.status(403).send('Forbidden');
    try {
        await DiaryEntry.findOneAndDelete({ _id: req.params.id, student: req.session.user.id });
        res.redirect('/student/dashboard?tab=diary_history&success=Entry deleted');
    } catch (err) {
        res.redirect('/student/dashboard?tab=diary_history&error=Deletion failed');
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
        const myInternships = await Internship.find({ company: req.session.user.id })
            .sort({ updatedAt: -1 });
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
                hired: applications.filter(app => app.status === 'selected').length,
                rescheduleRequests: applications.filter(app => app.rescheduleRequest).length
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

// Setup multer with Cloudinary for resume upload
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dqxspb6sc',
  api_key: '221695386134532',
  api_secret: 'xfAigpe8E_pzPzbCs1_dujgPh5I'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'conneto_resumes',
        format: async (req, file) => 'pdf',
    },
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// POST /student/profile/update - Enhanced with error handling
router.post('/student/profile/update', (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
        if (err) {
            // Flash an error message back to the dashboard
            console.error('File Upload Error:', err.message);
            const errMsg = err.message || 'File upload failed. Only PDFs are allowed.';
            return res.redirect(`/student/dashboard?tab=profile&error=${encodeURIComponent(errMsg)}`);
        }
        next();
    });
}, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.redirect('/auth/login');

    try {
        const {
            name, email, dob, gender, usn, college, degree, department, semester, year, gpa,
            address, city, state, country, bio, experience, projects, skills, interests,
            certifications, languages, phone, linkedin, github, portfolio, memberStatus
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

        // 2. Resume URL
        let resumeUrl = null;
        if (req.file) {
            resumeUrl = req.file.path; // Cloudinary secure URL
        }

        // 3. Conditional Completion Percentage (100% Target)
        // Core Fields (Required for ALL to reach 100%)
        const coreFields = [name, email, dob, gender, phone, address, city, state, country, 
                          degree, department, memberStatus, skills, bio,
                          languages, interests, linkedin, github, portfolio];
        
        let filledCore = coreFields.filter(val => val && val.toString().trim().length > 0).length;
        
        const existingProfile = await StudentProfile.findOne({ user: req.session.user.id });
        const finalResumeUrl = resumeUrl || (existingProfile ? existingProfile.resumeUrl : null);
        if (finalResumeUrl) filledCore++; // 19 core text/select + 1 resume = 20 fields total

        let finalPercent = Math.min(Math.round((filledCore / 20) * 100), 100);

        // EXTRA for Students (Learning Engineers)
        if (memberStatus === 'Student') {
            const academicFields = [usn, college, semester, year, gpa];
            let filledAcademic = academicFields.filter(val => val && val.toString().trim().length > 0).length;
            
            // For students, 100% requires all 25 fields (20 core + 5 academic)
            finalPercent = Math.min(Math.round(((filledCore + filledAcademic) / 25) * 100), 100);
        }

        // 4. Update Profile Data
        const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const interestsArr = interests ? interests.split(',').map(s => s.trim()).filter(s => s) : [];

        const updateData = {
            dob, gender, usn, college, degree, department, semester, year, gpa,
            memberStatus, address, city, state, country, bio, experience, projects,
            certifications, languages,
            skills: skillsArr,
            interests: interestsArr,
            phone, linkedin, github, portfolio,
            completionPercentage: finalPercent,
            updatedAt: Date.now()
        };

        if (resumeUrl) {
            updateData.resumeUrl = resumeUrl;
        }

        await StudentProfile.findOneAndUpdate(
            { user: req.session.user.id },
            updateData,
            { upsert: true, new: true }
        );

        res.redirect('/student/dashboard?tab=profile&success=1');
    } catch (err) {
        console.error('Portfolio Save Error:', err);
        res.redirect('/student/dashboard?tab=profile&error=1');
    }
});

// POST /student/applications/:id/reschedule - Request rescheduling
router.post('/student/applications/:id/reschedule', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') return res.redirect('/auth/login');

    try {
        const { reason, suggestedDate } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application || application.student.toString() !== req.session.user.id) {
            return res.redirect('/student/dashboard?tab=applications&error=Application not found');
        }

        application.rescheduleRequest = true;
        application.rescheduleReason = reason || 'No reason provided';
        application.suggestedInterviewDate = suggestedDate ? new Date(suggestedDate) : null;
        application.rescheduleStatus = 'pending';
        application.updatedAt = Date.now();

        await application.save();

        res.redirect('/student/dashboard?tab=applications&success=Rescheduling request sent successfully');
    } catch (err) {
        console.error('Reschedule Request Error:', err);
        res.redirect('/student/dashboard?tab=applications&error=Failed to send request');
    }
});

module.exports = router;
