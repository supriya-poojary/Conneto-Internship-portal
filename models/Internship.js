const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String }, // Overriding company name at internship level
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ['remote', 'on-site', 'hybrid'], default: 'remote' },
    duration: { type: String },        // e.g. "2 months"
    requiredDiaries: { type: Number, default: 30 }, // Total days student should log
    paymentCategory: { type: String, enum: ['unpaid', 'stipend', 'paid'], default: 'unpaid' },
    stipend: { type: Number, default: 0 },        // Company pays Student (INR/month)
    fee: { type: Number, default: 0 },            // Student pays Company (Fee)
    skills: [{ type: String }],
    openings: { type: Number, default: 1 },
    image: { type: String },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
