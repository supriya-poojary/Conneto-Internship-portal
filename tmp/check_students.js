const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const users = await User.find({ role: 'student' }).limit(5);
        console.log('Students:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));
        
        const selectedApps = await Application.find({ status: 'selected' }).populate('student');
        console.log('Selected Applications Students:', selectedApps.map(a => a.student ? a.student.email : 'No Student'));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
