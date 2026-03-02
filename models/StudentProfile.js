const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    college: { type: String },
    degree: { type: String },
    branch: { type: String },
    year: { type: Number },
    gpa: { type: Number },
    skills: [{ type: String }],
    bio: { type: String },
    resumeUrl: { type: String },      // path to uploaded resume
    phone: { type: String },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    location: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
