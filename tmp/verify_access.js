const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        const users = await User.find({ email: { $in: ['rohith143@gmail.com', 'aman123@gmail.com'] } });
        console.log('Verification Results:', users.map(u => ({ email: u.email, role: u.role, status: u.status })));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
