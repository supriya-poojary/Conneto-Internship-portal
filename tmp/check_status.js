const mongoose = require('mongoose');
const Application = require('../models/Application');

const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await Application.countDocuments({ status: 'selected' });
        console.log('Number of applications with status selected:', count);
        const all = await Application.find({}).limit(5);
        console.log('Sample applications:', all.map(a => a.status));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
