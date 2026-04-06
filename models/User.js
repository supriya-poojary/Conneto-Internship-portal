const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true }, // For company users
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'company', 'admin'], required: true },
    googleId: { type: String, unique: true, sparse: true },
    cin: { type: String, trim: true },
    companyType: { 
        type: String, 
        enum: ['Private Limited', 'Public Limited', 'Proprietorship', 'Partnership', 'Branch Office', 'Other'],
        trim: true 
    },
    companyDocuments: [
        {
            docName: { type: String },
            docUrl: { type: String },
            docData: { type: Buffer },
            contentType: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    companyAddress: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' // Default for everyone now; we need to decide if students should be approved automatically
    },
    rejectionReason: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
