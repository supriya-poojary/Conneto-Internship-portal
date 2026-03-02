const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ['remote', 'on-site', 'hybrid'], default: 'remote' },
    duration: { type: String },        // e.g. "2 months"
    stipend: { type: Number },        // in INR/month; 0 = unpaid
    skills: [{ type: String }],
    openings: { type: Number, default: 1 },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Internship', internshipSchema);
