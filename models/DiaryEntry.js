const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    date: { type: Date, required: true },
    workSummary: { type: String, required: true, maxlength: 2000 },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    links: { type: String, maxlength: 5000 },
    learnings: { type: String, required: true, maxlength: 2000 },
    blockers: { type: String, maxlength: 1000 },
    skillsUsed: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Avoid multiple entries for the same day for the same internship by the same student
diaryEntrySchema.index({ student: 1, internship: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
