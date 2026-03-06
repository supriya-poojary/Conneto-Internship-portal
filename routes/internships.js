const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
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
        const { title, companyName, description, location, type, duration, stipend, skills, openings, deadline } = req.body;

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
            stipend: stipend || 0,
            skills: skillsArray,
            openings: openings || 1,
            deadline: deadline ? new Date(deadline) : null,
            isActive: true
        });

        console.log('Internship created:', internship._id);
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
            .sort({ createdAt: -1 });

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

        res.render('internships/manage', {
            title: 'Manage Internships | Conneto',
            user: req.session.user,
            internships: internshipsWithCounts
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
        const { title, companyName, description, location, type, duration, stipend, skills, openings, deadline, isActive } = req.body;

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
                stipend: stipend || 0,
                skills: skillsArray,
                openings: openings || 1,
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
            .sort({ appliedAt: -1 })
            .lean();

        // Attach student profiles
        for (let app of applications) {
            if (app.student && app.student._id) {
                app.student.profile = await StudentProfile.findOne({ user: app.student._id }).lean() || {};
            }
        }


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

        res.render('company/applications', {
            title: 'View Applications | Conneto',
            user: req.session.user,
            groupedApplications: Object.values(groupedByInternship),
            internships
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

        res.redirect('/company/applications?success=Student shortlisted');
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
        application.updatedAt = new Date();
        await application.save();

        res.redirect('/company/applications?success=Interview scheduled');
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

        res.redirect('/company/applications?success=Student selected/hired');
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

        res.redirect('/company/applications?success=Application rejected');
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
router.get('/internships/:id', async (req, res) => {
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
        if (req.session.user && req.session.user.role === 'student') {
            myApplication = await Application.findOne({
                internship: req.params.id,
                student: req.session.user.id
            });
            hasApplied = !!myApplication;
        }

        res.render('internships/details', {
            title: `${internship.title} | Conneto`,
            user: req.session.user || null,
            internship,
            hasApplied,
            myApplication
        });
    } catch (err) {
        console.error('Error loading internship:', err);
        res.redirect('/internships?error=Failed to load internship');
    }
});

// Setup multer for resume upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/resumes';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
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

// POST /internships/:id/apply - Apply for internship
router.post('/internships/:id/apply', isAuthenticated, isStudent, upload.single('resume'), async (req, res) => {
    try {
        const { coverLetter, studentSkills, question1Answer, question2Answer } = req.body;

        let resumeUrl = '';
        let extractedSkills = [];

        if (req.file) {
            resumeUrl = '/uploads/resumes/' + req.file.filename;

            // Extract text from PDF to find skills
            try {
                const dataBuffer = fs.readFileSync(req.file.path);
                const data = await pdfParse(dataBuffer);
                const text = data.text.toLowerCase();

                // Common skills library to look for (simplified)
                const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'express', 'html', 'css', 'sql', 'mongodb', 'docker', 'git', 'aws', 'communication', 'leadership', 'design'];

                extractedSkills = commonSkills.filter(skill => text.includes(skill.toLowerCase()));
            } catch (pdfErr) {
                console.error("Error parsing PDF resume:", pdfErr);
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

        // Create application
        await Application.create({
            internship: req.params.id,
            student: req.session.user.id,
            coverLetter: coverLetter || '',
            studentSkills: studentSkills || '',
            question1Answer: question1Answer || '',
            question2Answer: question2Answer || '',
            resumeUrl: resumeUrl,
            extractedSkills: extractedSkills,
            status: 'applied'
        });

        res.redirect('/student/dashboard?applied=1#applications');
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

        res.render('student/applications', {
            title: 'My Applications | Conneto',
            user: req.session.user,
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
