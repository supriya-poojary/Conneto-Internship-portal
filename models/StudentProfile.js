const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    college: { type: String },
    degree: { type: String },
    branch: { type: String },
    usn: { type: String },
    department: { type: String },
    semester: { type: Number },
    year: { type: Number },
    gpa: { type: Number },
    skills: [{ type: String }],
    interests: [{ type: String }],
    bio: { type: String },
    resumeUrl: { type: String },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    location: { type: String },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    experience: { type: String },
    projects: { type: String },
    languages: { type: String },
    certifications: { type: String },
    completionPercentage: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
