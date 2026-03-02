const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true },
    industry: { type: String },
    website: { type: String },
    description: { type: String },
    location: { type: String },
    logoUrl: { type: String },
    phone: { type: String },
    verified: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
