const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function approve() {
    try {
        await mongoose.connect(MONGODB_URI);
        const emails = ['rohith143@gmail.com', 'aman123@gmail.com'];
        const result = await User.updateMany(
            { email: { $in: emails } },
            { $set: { status: 'Approved' } }
        );
        console.log(`Approved ${result.modifiedCount} companies.`);
        
        // Also check if they are actually companies
        const users = await User.find({ email: { $in: emails } });
        console.log('User roles:', users.map(u => ({ email: u.email, role: u.role, status: u.status })));
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

approve();
