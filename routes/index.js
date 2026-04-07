const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const DiaryEntry = require('../models/DiaryEntry');
const Leave = require('../models/Leave');
const { generateCertificate } = require('../utils/certificateGenerator');
const { upload } = require('../config/upload');

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

        // NEW: Calculate unreadLogs from diaryEntries
        const totalDiaryCount = await DiaryEntry.countDocuments({ student: req.session.user.id });

        const stats = {
            total: applications.length,
            interviews: applications.filter(app => ['interview_scheduled', 'shortlisted'].includes(app.status)).length,
            pending: applications.filter(app => ['applied', 'under_review'].includes(app.status)).length,
            hired: applications.filter(app => app.status === 'selected').length,
            unreadLogs: totalDiaryCount
        };

        const profile = await StudentProfile.findOne({ user: req.session.user.id });

        let diaryEntries = [];
        let viewInternshipId = req.query.viewInternshipId || null;
        let selectedInternships = applications.filter(app => app.status === 'selected');

        if (activeTab === 'diary' || activeTab === 'diary_history' || activeTab === 'dashboard' || activeTab === 'leaves' || activeTab === 'leave_history') {
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
        if (activeTab === 'leaves') pageTitle = 'Apply for Leave | Conneto';
        if (activeTab === 'leave_history') pageTitle = 'Leave Status Tracking | Conneto';

        res.render('dashboard/student', {
            title: pageTitle,
            user: req.session.user,
            activePage: activeTab,
            stats,
            internships,
            applications,
            selectedInternships: selectedInternships.map(app => {
                // Attach total/approved diary counts for certificate logic in view
                const myEntries = diaryEntries.filter(e => e.internship._id.toString() === app.internship._id.toString());
                return {
                    ...app.toObject(),
                    totalDiaries: myEntries.length,
                    approvedDiaries: myEntries.filter(e => e.status === 'approved').length,
                    rejectedDiaries: myEntries.filter(e => e.status === 'rejected').length,
                    pendingDiaries: myEntries.filter(e => e.status === 'pending').length
                };
            }),
            diaryEntries,
            viewInternshipId,
            profile: profile || {},
            leaves: await Leave.find({
                student: req.session.user.id,
                ...(viewInternshipId ? { internship: viewInternshipId } : {})
            })
                .populate({
                    path: 'internship',
                    populate: { path: 'company', select: 'companyName name' }
                }).sort({ createdAt: -1 }),
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

        // Check for approved leave on this date
        const leave = await Leave.findOne({
            student: req.session.user.id,
            internship: internshipId,
            status: 'Approved',
            startDate: { $lte: d },
            endDate: { $gte: d }
        });

        if (leave) {
            return res.redirect(`/student/dashboard?tab=diary&viewInternshipId=${internshipId}&error=You are on leave for this date. Diary entries are not permitted.`);
        }

        await DiaryEntry.create({

            student: req.session.user.id,
            internship: internshipId,
            date: d,
            hoursWorked, workSummary, links, learnings, blockers, skillsUsed
        });
        res.redirect(`/student/dashboard?tab=diary&viewInternshipId=${internshipId}&success=Entry+successfully+saved`);
    } catch (err) {
        if (err.code === 11000) {
            console.log('Diary Entry: Duplicate log submission prevented for date.');
            res.redirect('/student/dashboard?tab=diary&error=You+have+already+submitted+a+diary+log+for+this+date.+Please+edit+the+existing+one.');
        } else {
            console.error('Diary Error:', err);
            res.redirect('/student/dashboard?tab=diary&error=Failed+to+save+entry.+Please+try+again.');
        }
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
            {
                date: d, hoursWorked, workSummary, links, learnings, blockers, skillsUsed,
                status: 'pending', // Reset status on edit
                updatedAt: Date.now()
            }
        );
        res.redirect('/student/dashboard?tab=diary_history&success=Entry updated and sent for re-evaluation');
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

// Company Evaluation Routes
router.post('/company/diary/evaluate/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'company') return res.status(403).send('Forbidden');
    const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=evaluations');
    try {
        const { status, remarks } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).send('Invalid status');
        }

        await DiaryEntry.findByIdAndUpdate(req.params.id, {
            status,
            remarks,
            evaluatedAt: Date.now(),
            updatedAt: Date.now()
        });

        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}success=Manual evaluation recorded`);
    } catch (err) {
        console.error('Evaluation error:', err);
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Evaluation failed`);
    }
});

router.post('/company/internship/certificate/:applicationId', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'company') return res.status(403).send('Forbidden');
    const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=evaluations');
    try {
        const app = await Application.findById(req.params.applicationId);
        if (!app) return res.status(404).send('Application not found');

        // Verify company owns internship
        const internship = await Internship.findById(app.internship);
        if (internship.company.toString() !== req.session.user.id) {
            return res.status(403).send('Unauthorized');
        }

        app.certificateReleased = true;
        app.certificateDate = Date.now();
        // Generate a simple unique ID for verification
        app.certificateId = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        await app.save();

        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}success=Manual certificate released`);
    } catch (err) {
        console.error('Certificate release error:', err);
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Failed to release certificate`);
    }
});

router.post('/company/internship/certificate/upload/:applicationId', (req, res, next) => {
    upload.single('certificate')(req, res, function (err) {
        const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=evaluations');
        if (err) return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=${encodeURIComponent(err.message)}`);
        next();
    });
}, async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'company') {
        return res.redirect('/auth/login');
    }
    const redirectTo = getCompanyDashboardRedirect(req, '/company/dashboard?tab=evaluations');

    try {
        const app = await Application.findById(req.params.applicationId);
        if (!app) {
            return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Application record not found`);
        }

        // Verify company ownership via internship
        const internship = await Internship.findById(app.internship);
        if (!internship || internship.company.toString() !== req.session.user.id) {
            return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=Unauthorized access`);
        }

        if (!req.file) {
            return res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=No certificate file selected`);
        }

        // Overwrite existing certificate data (Binary Storage)
        app.certificateReleased = true;
        app.certificateDate = Date.now();
        app.certificateData = req.file.buffer;
        app.certificateType = req.file.mimetype;
        app.certificateId = app.certificateId || 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        await app.save();

        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}success=Professionally updated certificate has been released successfully`);
    } catch (err) {
        console.error('Certificate upload error:', err);
        res.redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}error=An unexpected error occurred during upload. Please try again.`);
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

    const requestedTab = req.query.tab || 'dashboard';
    const activeTab = {
        applications: 'applications',
        internships: 'internships',
        evaluations: 'evaluations',
        leaves: 'leaves',
        settings: 'settings',
        profile: 'settings',
        dashboard: 'dashboard'
    }[requestedTab] || 'dashboard';
    const viewInternshipId = req.query.viewInternshipId || null;

    try {
        const myInternships = await Internship.find({ company: req.session.user.id })
            .sort({ updatedAt: -1 });
        const applications = await Application.find({
            internship: { $in: myInternships.map(i => i._id) }
        })
            .populate('student', 'name email phone')
            .populate('internship')
            .sort({ appliedAt: -1 });
        const validApplications = applications.filter(app => app && app.student && app.internship);

        // NEW: Fetch profiles for each student in the pipeline
        const studentIds = validApplications.map(app => app.student._id);
        const profiles = await StudentProfile.find({ user: { $in: studentIds } });

        // Attach profile to each application object
        validApplications.forEach(app => {
            app.profile = profiles.find(p => p.user.toString() === app.student._id.toString()) || {};
        });

        // Calculate stats for Each Internship (for the management tab)
        const internshipsWithStats = myInternships.map(int => {
            const intApps = validApplications.filter(a => a.internship && a.internship._id.toString() === int._id.toString());
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
            if (!viewInternshipId || viewInternshipId === int._id.toString()) {
                grouped[int._id] = { internship: int, applications: [] };
            }
        });
        validApplications.forEach(app => {
            if (app.internship && grouped[app.internship._id]) {
                grouped[app.internship._id].applications.push(app);
            }
        });

        // Diary Evaluation Data: Fetch all 'selected' students for company's internships
        let selectedApplications = validApplications.filter(app => app.status === 'selected');
        if (viewInternshipId) {
            selectedApplications = selectedApplications.filter(app => app.internship && app.internship._id.toString() === viewInternshipId);
        }
        const evaluationData = [];

        for (const app of selectedApplications) {
            const diEntries = await DiaryEntry.find({
                student: app.student._id,
                internship: app.internship._id
            }).sort({ date: -1 });

            evaluationData.push({
                applicationId: app._id,
                student: app.student,
                internship: app.internship,
                profile: app.profile,
                entries: diEntries,
                pendingCount: diEntries.filter(e => e.status === 'pending').length,
                approvedCount: diEntries.filter(e => e.status === 'approved').length,
                totalEntries: diEntries.length,
                requiredDiaries: app.internship.requiredDiaries || 30, // Default to 30 if not set
                isCertificateReleased: app.certificateReleased,
                certificateUrl: app.certificateUrl
            });
        }

        // Fetch leaves
        const leaves = await Leave.find({
            internship: viewInternshipId ? viewInternshipId : { $in: myInternships.map(i => i._id) }
        }).populate('student').populate('internship').sort({ createdAt: -1 });

        res.render('dashboard/company', {
            title: 'Company Dashboard | Conneto',
            user: req.session.user,
            activePage: activeTab,
            viewInternshipId,
            openDiaryId: req.query.openDiaryId || null,
            focusApplicationId: req.query.focusApplicationId || null,
            stats: {
                active: myInternships.filter(i => i.isActive).length,
                totalApplicants: validApplications.length,
                interviews: validApplications.filter(app => ['interview_scheduled', 'shortlisted'].includes(app.status)).length,
                hired: validApplications.filter(app => app.status === 'selected').length,
                rescheduleRequests: validApplications.filter(app => app.rescheduleRequest).length,
                pendingEvaluations: evaluationData.reduce((acc, curr) => acc + curr.pendingCount, 0),
                pendingLeaves: leaves.filter(l => l.status === 'Pending').length
            },
            applicants: validApplications.slice(0, 10),
            myInternships: internshipsWithStats,
            groupedApplications: Object.values(grouped),
            evaluationData,
            totalApplications: validApplications.length,
            leaves,
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
router.get('/company/profile', (req, res) => res.redirect('/company/dashboard?tab=settings'));
router.get('/company/internships', (req, res) => res.redirect('/company/dashboard?tab=internships'));

// The upload middleware is now imported from config/cloudinary.js at the top of the file

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

        // 2. Resume Update (Binary & Legacy)
        let resumeData = null;
        let resumeType = null;
        let resumeUrl = null;

        if (req.file) {
            resumeData = req.file.buffer;
            resumeType = req.file.mimetype;
            resumeUrl = '/view-document?type=resume&docId=' + req.session.user.id; // Corrected ID-based proxy
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

        if (req.file) {
            updateData.resumeData = req.file.buffer;
            updateData.resumeType = req.file.mimetype;
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

// GET /view-document - Proxy to force inline viewing/downloading of PDFs/Images
router.get('/view-document', async (req, res) => {
    const { type, userId, docId, name, download, url: targetUrl } = req.query;
    
    // Security: Only logged in users (Passport req.isAuthenticated() or Legacy session) can access
    const isAuthed = (req.session && req.session.user) || (typeof req.isAuthenticated === 'function' && req.isAuthenticated());
    
    if (!isAuthed) {
        return res.redirect('/auth/login?error=Session expired. Please sign in again.');
    }
    
    try {
        let fileBuffer, mimeType, fileName;

        if (type === 'company' && docId) {
            let docOwner;
            const docObjectId = mongoose.Types.ObjectId.isValid(docId) ? new mongoose.Types.ObjectId(docId) : null;
            
            if (!docObjectId) return res.status(400).send('Invalid document reference format');

            // 1. Optimized lookup via projection: only fetch the matching document subdocument
            docOwner = await User.findOne(
                { "companyDocuments._id": docObjectId },
                { "companyDocuments.$": 1 } 
            );

            if (!docOwner || !docOwner.companyDocuments || docOwner.companyDocuments.length === 0) {
                return res.status(404).send('Document not found in Conneto archives');
            }
            
            const doc = docOwner.companyDocuments[0];
            if (!doc) return res.status(404).send('Document record corrupted');
            
            if (doc.docData) {
                fileBuffer = doc.docData;
                mimeType = doc.contentType || 'application/pdf';
                fileName = name || (doc.docName ? doc.docName.replace(/_/g, ' ') : 'legal_doc');
            } else if (doc.docUrl) {
                const targetUrl = doc.docUrl;
                if (targetUrl.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '../public', targetUrl);
                    if (fs.existsSync(filePath)) {
                        return res.download(filePath, name || 'document.pdf');
                    }
                }
                
                // Asset proxy for external/legacy URLs
                try {
                    const response = await fetch(targetUrl);
                    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                    fileBuffer = Buffer.from(await response.arrayBuffer());
                    mimeType = response.headers.get('content-type') || 'application/pdf';
                    fileName = name || 'legal_doc';
                } catch (err) {
                    console.error('Proxy Fetch Error:', err);
                    return res.status(404).send(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Document Unavailable</h2><p>This legacy document is no longer accessible from its original host (Authorization Expired/401). Please request the company to re-upload it.</p></body></html>`);
                }
            }
        } else if (type === 'resume' && docId) {
            // Optimized Resume Fetch (using ID from app or user)
            const app = await Application.findById(docId, 'resumeData resumeType resumeUrl student');
            if (app && app.resumeData) {
                fileBuffer = app.resumeData;
                mimeType = app.resumeType || 'application/pdf';
            } else {
                // Try student profile
                const studentId = (app && app.student) ? app.student : docId;
                const profile = await StudentProfile.findOne({ user: studentId }, 'resumeData resumeType resumeUrl');

                if (profile && profile.resumeData) {
                    fileBuffer = profile.resumeData;
                    mimeType = profile.resumeType || 'application/pdf';
                } else if (profile && profile.resumeUrl) {
                    const targetUrl = profile.resumeUrl;
                    // Fallback for legacy profile with only URLs
                    if (targetUrl.startsWith('/uploads/')) {
                        const filePath = path.join(__dirname, '../public', targetUrl);
                        if (fs.existsSync(filePath)) {
                            return res.download(filePath, name || 'resume.pdf');
                        }
                    }
                    
                    // Asset proxy for external/legacy URLs to prevent 401 on redirects
                    try {
                        const response = await fetch(targetUrl);
                        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                        fileBuffer = Buffer.from(await response.arrayBuffer());
                        mimeType = response.headers.get('content-type') || 'application/pdf';
                    } catch (err) {
                        console.error('Resume Proxy Error:', err);
                        return res.redirect(targetUrl);
                    }
                } else if (app && app.resumeUrl) {
                    // Fallback for legacy application with only URLs
                    const targetUrl = app.resumeUrl;
                    if (targetUrl.startsWith('/uploads/')) {
                        const filePath = path.join(__dirname, '../public', targetUrl);
                        if (fs.existsSync(filePath)) {
                            return res.download(filePath, name || 'resume.pdf');
                        }
                    }
                    
                    try {
                        const response = await fetch(targetUrl);
                        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                        fileBuffer = Buffer.from(await response.arrayBuffer());
                        mimeType = response.headers.get('content-type') || 'application/pdf';
                    } catch (err) {
                        return res.redirect(targetUrl);
                    }
                }
            }
            fileName = name || 'resume';
        } else if (type === 'certificate' && docId) {
            // Optimized Certificate Fetch
            const app = await Application.findById(docId, 'certificateData certificateType');
            if (app && app.certificateData) {
                fileBuffer = app.certificateData;
                mimeType = app.certificateType || 'application/pdf';
                fileName = name || 'Internship_Completion_Certificate.pdf';
            } else {
                return res.status(404).send('Certificate data not found for this submission');
            }
        } else {
            // Fallback for legacy local files or URLs
            if (targetUrl) {
                if (targetUrl.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '../public', targetUrl);
                    if (fs.existsSync(filePath)) {
                        return res.download(filePath, name || path.basename(filePath), (err) => {
                            if (err && !res.headersSent) {
                                console.error('Download Error:', err);
                                res.status(404).send('File no longer exists or is inaccessible.');
                            }
                        });
                    } else {
                        console.warn(`[Warning] Legacy redirect record points to missing path: ${filePath}`);
                        return res.status(404).send('Document not found in storage. Please re-upload.');
                    }
                }
                
                // If the client requested a download, fetch the file and pipe it through with the correct filename header
                // instead of redirecting directly to a potentially extensionless Cloudinary URL
                if (download === 'true') {
                    try {
                        const response = await fetch(targetUrl);
                        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                        fileBuffer = Buffer.from(await response.arrayBuffer());
                        mimeType = response.headers.get('content-type') || 'application/pdf';
                        fileName = name || 'document.pdf';
                    } catch (err) {
                        console.error('Fetch Error for Document:', err);
                        return res.redirect(targetUrl);
                    }
                } else {
                    return res.redirect(targetUrl);
                }
            } else {
                return res.status(400).send('Invalid request parameters');
            }
        }

        if (!fileBuffer) return res.status(404).send('File data missing');

        // Set Headers
        res.set('Content-Type', mimeType);
        if (download === 'true') {
            const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(safeName)}"`);
        } else {
            res.set('Content-Disposition', 'inline');
        }

        return res.send(fileBuffer);
    } catch (e) {
        console.error('Document View Logic Error:', e);
        res.status(500).send('Internal Server Error processing document');
    }
});

// GET /student/certificate/:id/download - Professional dynamic PDF generation or Cloudinary proxy
router.get('/student/certificate/:id/download', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');

    try {
        const app = await Application.findById(req.params.id)
            .populate('student', 'name')
            .populate({
                path: 'internship',
                populate: { path: 'company', select: 'companyName name' }
            });

        if (!app) return res.status(404).send('Application not found');

        // Security: Only the student themselves or the company can download
        if (req.session.user.role === 'student' && app.student._id.toString() !== req.session.user.id) {
            return res.status(403).send('Unauthorized to access this certificate');
        }

        if (!app.certificateReleased) {
            return res.status(403).send('Certificate has not been released for this internship yet.');
        }

        // Case 1: Company uploaded a custom binary certificate to MongoDB (Direct Download)
        if (app.certificateData) {
            const mimeType = app.certificateType || 'application/pdf';
            res.set('Content-Type', mimeType);
            
            let ext = '.pdf';
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
            else if (mimeType.includes('png')) ext = '.png';
            
            const fileName = `Certificate_${app.student.name.replace(/\s+/g, '_')}${ext}`;
            res.set('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(app.certificateData);
        }

        // Case 2: Company uploaded a custom PDF certificate to Cloudinary or legacy URL
        if (app.certificateUrl) {
            const fileName = `Certificate_${app.student.name.replace(/\s+/g, '_')}_${app.certificateId || 'ID'}`;
            return res.redirect(`/view-document?url=${encodeURIComponent(app.certificateUrl)}&name=${encodeURIComponent(fileName)}&download=true`);
        }

        // Case 3: Platform-generated dynamic certificate (Manual Release)
        const certData = {
            studentName: app.student.name,
            internshipTitle: app.internship.title,
            companyName: (app.internship.company ? (app.internship.company.companyName || app.internship.company.name) : app.internship.companyName) || 'Company',
            date: app.certificateDate || Date.now(),
            certificateId: app.certificateId || 'CERT-PREMIUM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        generateCertificate(certData, res);

    } catch (err) {
        console.error('Certificate Download Error:', err);
        res.status(500).send('An error occurred while generating your certificate.');
    }
});

// Alias for backwards compatibility
router.get('/view-resume', (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send('No URL provided');
    res.redirect(`/view-document?url=${encodeURIComponent(url)}&name=resume`);
});

module.exports = router;

