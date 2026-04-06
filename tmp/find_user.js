const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ email: 'akankshaa412@gmail.com' });
        console.log('User akankshaa412@gmail.com:', user ? 'EXISTS' : 'NOT FOUND');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
