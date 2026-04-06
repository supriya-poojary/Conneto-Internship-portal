const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Leave = require('../models/Leave');

// Middleware to check if user is logged in and approved
const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        // Safety check for approval status (in case session is stale)
        const User = require('../models/User');
        const user = await User.findById(req.session.user.id);
        if (!user || (user.role === 'company' && user.status !== 'Approved')) {
            req.session.destroy(() => {
                res.redirect('/auth/login?error=Account not approved or found.');
            });
            return;
        }
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.redirect('/auth/login?error=Something went wrong.');
    }
};

// Middleware to check if user is a company
const isCompany = (req, res, next) => {
    if (req.session.user.role !== 'company') {
        return res.redirect('/');
    }
    next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
    if (req.session.user.role !== 'student') {
        return res.redirect('/');
    }
    next();
};

// ============================================
// COMPANY ROUTES
// ============================================

// GET /company/internships/create - Show create internship form
router.get('/company/internships/create', isAuthenticated, isCompany, async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({ user: req.session.user.id });
        res.render('internships/create', {
            title: 'Post Internship | Conneto',
            user: req.session.user,
            company: companyProfile
        });
    } catch (err) {
        console.error('Error loading create form:', err);
        res.redirect('/company/dashboard');
    }
});

// POST /company/internships - Create new internship
router.post('/company/internships', isAuthenticated, isCompany, async (req, res) => {
    try {
        const { title, companyName, description, location, type, duration, paymentCategory, stipend, fee, skills, openings, deadline, image } = req.body;

        // Parse skills if it's a string
        let skillsArray = [];
        if (skills) {
            if (Array.isArray(skills)) {
                skillsArray = skills;
            } else if (typeof skills === 'string') {
                skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        const internship = await Internship.create({
            company: req.session.user.id,
            companyName: companyName,
            title,
            description,
            location,
            type: type || 'remote',
            duration,
            requiredDiaries: req.body.requiredDiaries || 30,
            paymentCategory: paymentCategory || 'unpaid',
            stipend: paymentCategory === 'stipend' ? (stipend || 0) : 0,
            fee: paymentCategory === 'paid' ? (fee || 0) : 0,
            skills: skillsArray,
            openings: openings || 1,
            image: image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80',
            deadline: deadline ? new Date(deadline) : null,
            isActive: true
        });


        res.redirect('/company/dashboard?success=internship_created');
    } catch (err) {
        console.error('Error creating internship:', err);
        res.redirect('/company/internships/create?error=Failed to create internship');
    }
});

// GET /company/internships - List company's internships
router.get('/company/internships', isAuthenticated, isCompany, async (req, res) => {
    try {
        const internships = await Internship.find({ company: req.session.user.id })
            .sort({ updatedAt: -1 });

        // Get application counts for each internship
        const internshipsWithCounts = await Promise.all(internships.map(async (internship) => {
            const counts = await Application.aggregate([
                { $match: { internship: internship._id } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const stats = {
                total: 0,
                applied: 0,
                under_review: 0,
                shortlisted: 0,
                interview_scheduled: 0,
                selected: 0,
                rejected: 0
            };

            counts.forEach(c => {
                stats[c._id] = c.count;
                stats.total += c.count;
            });

            return { ...internship.toObject(), stats };
        }));

        res.render('dashboard/company', {
            title: 'Manage Internships | Conneto',
            user: req.session.user,
            activePage: 'internships',
            myInternships: internshipsWithCounts,
            leaves: await Leave.find({
                internship: { $in: internships.map(i => i._id) }
            }).populate('student').populate('internship').sort({ createdAt: -1 })
        });
    } catch (err) {
        console.error('Error loading internships:', err);
        res.redirect('/company/dashboard');
    }
});

// GET /company/internships/:id/edit - Show edit internship form
router.get('/company/internships/:id/edit', isAuthenticated, isCompany, async (req, res) => {
    try {
        const internship = await Internship.findOne({
            _id: req.params.id,
            company: req.session.user.id
        });

        if (!internship) {
            return res.redirect('/company/internships?error=Internship not found');
        }

        res.render('internships/edit', {
            title: 'Edit Internship | Conneto',
            user: req.session.user,
            internship
        });
    } catch (err) {
        console.error('Error loading edit form:', err);
        res.redirect('/company/internships');
    }
});

// POST /company/internships/:id - Update internship
router.post('/company/internships/:id', isAuthenticated, isCompany, async (req, res) => {
    try {
        const { title, companyName, description, location, type, duration, paymentCategory, stipend, fee, skills, openings, deadline, isActive, image } = req.body;

        // Parse skills if it's a string
        let skillsArray = [];
        if (skills) {
            if (Array.isArray(skills)) {
                skillsArray = skills;
            } else if (typeof skills === 'string') {
                skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        const internship = await Internship.findOneAndUpdate(
            { _id: req.params.id, company: req.session.user.id },
            {
                title,
                companyName,
                description,
                location,
                type: type || 'remote',
                duration,
                requiredDiaries: req.body.requiredDiaries || 30,
                paymentCategory: paymentCategory || 'unpaid',
                stipend: paymentCategory === 'stipend' ? (stipend || 0) : 0,
                fee: paymentCategory === 'paid' ? (fee || 0) : 0,
                skills: skillsArray,
                openings: openings || 1,
                image: image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80',
                deadline: deadline ? new Date(deadline) : null,
                isActive: isActive === 'on' || isActive === true
            },
            { new: true }
        );

        if (!internship) {
            return res.redirect('/company/internships?error=Internship not found or unauthorized');
        }

        res.redirect('/company/internships?success=Internship updated');
    } catch (err) {
        console.error('Error updating internship:', err);
        res.redirect(`/company/internships/${req.params.id}/edit?error=Failed to update internship`);
    }
});

// POST /company/internships/:id/delete - Delete internship
router.post('/company/internships/:id/delete', isAuthenticated, isCompany, async (req, res) => {
    try {
        const result = await Internship.findOneAndDelete({
            _id: req.params.id,
            company: req.session.user.id
        });

        if (!result) {
            return res.redirect('/company/internships?error=Internship not found or unauthorized');
        }

        // Also delete all applications for this internship
        await Application.deleteMany({ internship: req.params.id });

        res.redirect('/company/internships?success=Internship deleted');
    } catch (err) {
        console.error('Error deleting internship:', err);
        res.redirect('/company/internships?error=Failed to delete internship');
    }
});

// GET /company/applications - View all applications to company's internships
router.get('/company/applications', isAuthenticated, isCompany, async (req, res) => {
    try {
        // Get all internships by this company
        const internships = await Internship.find({ company: req.session.user.id });
        const internshipIds = internships.map(i => i._id);

        // Get all applications for company's internships
        const applications = await Application.find({ internship: { $in: internshipIds } })
            .populate('student')
            .populate({
                path: 'internship',
                select: 'title company'
            })
            .sort({ appliedAt: -1 });

        // Group by internship
        const groupedByInternship = {};
        internships.forEach(i => {
            groupedByInternship[i._id.toString()] = {
                internship: i,
                applications: []
            };
        });

        applications.forEach(app => {
            const key = app.internship._id.toString();
            if (groupedByInternship[key]) {
                groupedByInternship[key].applications.push(app);
            }
        });

        res.render('dashboard/company', {
            title: 'View Applications | Conneto',
            user: req.session.user,
            activePage: 'applications',
            groupedApplications: Object.values(groupedByInternship),
            internships,
            leaves: await Leave.find({
                internship: { $in: internshipIds }
            }).populate('student').populate('internship').sort({ createdAt: -1 })
        });
    } catch (err) {
        console.error('Error loading applications:', err);
        res.redirect('/company/dashboard');
    }
});

// POST /company/applications/:id/shortlist - Shortlist a candidate
router.post('/company/applications/:id/shortlist', isAuthenticated, isCompany, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('internship');

        if (!application) {
            return res.redirect('/company/applications?error=Application not found');
        }

        // Verify company owns this internship
        if (application.internship.company.toString() !== req.session.user.id) {
            return res.redirect('/company/applications?error=Unauthorized');
        }

        application.status = 'shortlisted';
        application.updatedAt = new Date();
        await application.save();

        res.redirect('/company/dashboard?tab=applications&success=Student shortlisted');
    } catch (err) {
        console.error('Error shortlisting:', err);
        res.redirect('/company/applications?error=Failed to shortlist');
    }
});

// POST /company/applications/:id/interview - Schedule interview
router.post('/company/applications/:id/interview', isAuthenticated, isCompany, async (req, res) => {
    try {
        const { interviewDate, interviewNote } = req.body;

        const application = await Application.findById(req.params.id)
            .populate('internship');

        if (!application) {
            return res.redirect('/company/applications?error=Application not found');
        }

        // Verify company owns this internship
        if (application.internship.company.toString() !== req.session.user.id) {
            return res.redirect('/company/applications?error=Unauthorized');
        }

        application.status = 'interview_scheduled';
        application.interviewDate = interviewDate ? new Date(interviewDate) : null;
        application.interviewNote = interviewNote || '';
        application.rescheduleRequest = false;
        application.rescheduleStatus = 'accepted';
        application.updatedAt = new Date();
        await application.save();

        res.redirect('/company/dashboard?tab=applications&success=Interview scheduled');
    } catch (err) {
        console.error('Error scheduling interview:', err);
        res.redirect('/company/applications?error=Failed to schedule interview');
    }
});

// POST /company/applications/:id/select - Select/Hire candidate
router.post('/company/applications/:id/select', isAuthenticated, isCompany, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('internship');

        if (!application) {
            return res.redirect('/company/applications?error=Application not found');
        }

        // Verify company owns this internship
        if (application.internship.company.toString() !== req.session.user.id) {
            return res.redirect('/company/applications?error=Unauthorized');
        }

        application.status = 'selected';
        application.updatedAt = new Date();
        await application.save();

        res.redirect('/company/dashboard?tab=applications&success=Student selected/hired');
    } catch (err) {
        console.error('Error selecting:', err);
        res.redirect('/company/applications?error=Failed to select');
    }
});

// POST /company/applications/:id/reject - Reject candidate
router.post('/company/applications/:id/reject', isAuthenticated, isCompany, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('internship');

        if (!application) {
            return res.redirect('/company/applications?error=Application not found');
        }

        // Verify company owns this internship
        if (application.internship.company.toString() !== req.session.user.id) {
            return res.redirect('/company/applications?error=Unauthorized');
        }

        application.status = 'rejected';
        application.updatedAt = new Date();
        await application.save();

        res.redirect('/company/dashboard?tab=applications&success=Application rejected');
    } catch (err) {
        console.error('Error rejecting:', err);
        res.redirect('/company/applications?error=Failed to reject');
    }
});

// ============================================
// STUDENT ROUTES
// ============================================

// GET /internships - Browse all active internships
router.get('/internships', async (req, res) => {
    try {
        const { search, location, type } = req.query;

        let query = { isActive: true };

        // Add filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        const internships = await Internship.find(query)
            .populate('company', 'companyName industry logoUrl')
            .sort({ createdAt: -1 });

        // If user is logged in, check which internships they've applied to
        let appliedIds = [];
        if (req.session.user && req.session.user.role === 'student') {
            const applications = await Application.find({ student: req.session.user.id });
            appliedIds = applications.map(a => a.internship.toString());
        }

        res.render('internships/browse', {
            title: 'Browse Internships | Conneto',
            user: req.session.user || null,
            internships,
            appliedIds,
            filters: { search, location, type }
        });
    } catch (err) {
        console.error('Error browsing internships:', err);
        res.render('internships/browse', {
            title: 'Browse Internships | Conneto',
            user: req.session.user || null,
            internships: [],
            appliedIds: [],
            filters: { search: '', location: '', type: '' }
        });
    }
});

// GET /internships/:id - View internship details
router.get('/internships/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate({
                path: 'company',
                select: 'companyName industry website description location logoUrl phone',
                model: 'User'
            });

        // If company is populated but doesn't have companyName, try to get from CompanyProfile
        let companyData = internship.company;
        if (companyData && !companyData.companyName) {
            const companyProfile = await CompanyProfile.findOne({ user: companyData._id });
            if (companyProfile) {
                // Return a combined object or prioritize the profile for display
                internship.company = companyProfile;
            }
        }

        if (!internship) {
            return res.redirect('/internships?error=Internship not found');
        }

        // Check if user has applied
        let hasApplied = false;
        let myApplication = null;
        let studentProfile = null;
        if (req.session.user && req.session.user.role === 'student') {
            myApplication = await Application.findOne({
                internship: req.params.id,
                student: req.session.user.id
            });
            hasApplied = !!myApplication;
            studentProfile = await StudentProfile.findOne({ user: req.session.user.id });
        }

        res.render('internships/details', {
            title: `${internship.title} | Conneto`,
            user: req.session.user || null,
            internship,
            hasApplied,
            myApplication,
            studentProfile
        });
    } catch (err) {
        console.error('Error loading internship:', err);
        res.redirect('/internships?error=Failed to load internship');
    }
});

// Setup local multer for resume upload
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const { upload } = require('../config/upload');

// POST /internships/:id/apply - Apply for internship
router.post('/internships/:id/apply', isAuthenticated, isStudent, (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
        if (err) {
            return res.redirect(`/internships/${req.params.id}?error=${encodeURIComponent(err.message)}`);
        }
        next();
    });
}, async (req, res) => {
    try {
        const { coverLetter, studentSkills, question1Answer, question2Answer } = req.body;

        let resumeUrl = '';
        let extractedSkills = [];

        if (req.file) {
            resumeUrl = '/uploads/' + req.file.filename;

            // Extract text from memory buffer to find skills
            try {
                // VALIDATE PDF SIGNATURE: First 5 bytes should be %PDF-
                if (req.file.buffer.length > 5 && req.file.buffer.toString('utf8', 0, 5) === '%PDF-') {
                    const data = await pdfParse(req.file.buffer);
                    const text = data.text.toLowerCase();

                    // Common skills library to look for (simplified)
                    const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'express', 'html', 'css', 'sql', 'mongodb', 'docker', 'git', 'aws', 'communication', 'leadership', 'design'];
                    extractedSkills = commonSkills.filter(skill => text.includes(skill.toLowerCase()));
                } else {
                    console.warn(`[Warning] Uploaded file ${req.file.filename} is not a valid PDF or is corrupted. Skill extraction skipped.`);
                }
            } catch (pdfErr) {
                // If it's a known 'bad XRef entry' or similar library limitation, log a clean warning
                if (pdfErr.message.includes('XRef') || pdfErr.details?.includes('XRef')) {
                    console.warn(`[Warning] Parsing failed for ${req.file.filename} (Complex/Encrypted PDF format). Skill extraction skipped, but file was saved successfully.`);
                } else {
                    console.error("Error parsing PDF resume:", pdfErr.message);
                }
            }
        }

        // Check if internship exists and is active
        const internship = await Internship.findById(req.params.id);
        if (!internship || !internship.isActive) {
            return res.redirect('/internships?error=Internship not available');
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            internship: req.params.id,
            student: req.session.user.id
        });

        if (existingApplication) {
            return res.redirect('/internships?error=You have already applied');
        }

        // PORTFOLIO GATE: Ensure student has 100% complete profile before applying
        const studentProfile = await StudentProfile.findOne({ user: req.session.user.id });
        const completionPct = studentProfile ? (studentProfile.completionPercentage || 0) : 0;
        if (completionPct < 100) {
            return res.redirect(`/internships/${req.params.id}?error=Your portfolio is currently at ${completionPct}%. Please reach 100% completion by filling out all profile fields to unlock the "Apply Now" button.`);
        }

        // Get resume URL from profile if not uploaded now
        const finalResumeUrl = resumeUrl || (studentProfile ? studentProfile.resumeUrl : '');

        // Create application (Binary Storage)
        await Application.create({
            internship: req.params.id,
            student: req.session.user.id,
            coverLetter: coverLetter || '',
            studentSkills: studentSkills || '',
            question1Answer: question1Answer || '',
            question2Answer: question2Answer || '',
            resumeData: req.file ? req.file.buffer : null,
            resumeType: req.file ? req.file.mimetype : null,
            extractedSkills: extractedSkills,
            status: 'applied'
        });

        res.redirect('/student/applications?success=Application submitted successfully');
    } catch (err) {
        console.error('Error applying:', err);
        res.redirect('/internships?error=Failed to submit application');
    }
});

// GET /student/applications - View student's applications
router.get('/student/applications', isAuthenticated, isStudent, async (req, res) => {
    try {
        const applications = await Application.find({ student: req.session.user.id })
            .populate({
                path: 'internship',
                populate: {
                    path: 'company',
                    select: 'companyName logoUrl'
                }
            })
            .sort({ appliedAt: -1 });

        const stats = {
            total: applications.length,
            applied: applications.filter(a => a.status === 'applied').length,
            under_review: applications.filter(a => a.status === 'under_review').length,
            shortlisted: applications.filter(a => a.status === 'shortlisted').length,
            interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
            selected: applications.filter(a => a.status === 'selected').length,
            rejected: applications.filter(a => a.status === 'rejected').length
        };

        res.render('dashboard/student', {
            title: 'My Applications | Conneto',
            user: req.session.user,
            activePage: 'applications',
            applications,
            stats
        });
    } catch (err) {
        console.error('Error loading applications:', err);
        res.redirect('/student/dashboard');
    }
});

// POST /student/applications/:id/withdraw - Withdraw application
router.post('/student/applications/:id/withdraw', isAuthenticated, isStudent, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application || application.student.toString() !== req.session.user.id) {
            return res.redirect('/student/applications?error=Application not found');
        }

        await Application.findByIdAndDelete(req.params.id);

        res.redirect('/student/applications?success=Application withdrawn');
    } catch (err) {
        console.error('Error withdrawing:', err);
        res.redirect('/student/applications?error=Failed to withdraw');
    }
});

module.exports = router;
