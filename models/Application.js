const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
        default: 'applied'
    },
    coverLetter: { type: String },
    resumeUrl: { type: String }, // legacy
    resumeData: { type: Buffer }, // Binary content
    resumeType: { type: String }, // Mime type
    studentSkills: { type: String }, // user input skills
    question1Answer: { type: String },
    question2Answer: { type: String },
    extractedSkills: { type: [String], default: [] }, // auto-extracted skills
    interviewDate: { type: Date },
    interviewNote: { type: String },   // company adds notes post-review
    rescheduleRequest: { type: Boolean, default: false },
    rescheduleReason: { type: String },
    suggestedInterviewDate: { type: Date },
    rescheduleStatus: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    certificateReleased: { type: Boolean, default: false },
    certificateDate: { type: Date },
    certificateId: { type: String }, // unique ID for verification
    certificateUrl: { type: String }, // legacy
    certificateData: { type: Buffer }, // Binary content
    certificateType: { type: String } // Mime type
});

// Each student can apply only once per internship
applicationSchema.index({ internship: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
