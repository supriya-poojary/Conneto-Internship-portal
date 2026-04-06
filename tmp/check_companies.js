const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const companies = await User.find({ role: 'company' });
        console.log('Companies and their statuses:');
        companies.forEach(c => {
            console.log(`- ${c.name} (${c.email}): ${c.status}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
