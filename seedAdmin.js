const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const seedAdmin = async () => {
    try {
        const MONGODB_URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";
        await mongoose.connect(process.env.MONGODB_URI || MONGODB_URI);
        
        const existing = await User.findOne({ email: 'admin@conneto.com' });
        if (existing) {
            console.log('Admin already exists');
            process.exit();
        }

        await User.create({
            name: 'System Admin',
            email: 'admin@conneto.com',
            password: 'AdminPassword123',
            role: 'admin',
            status: 'Approved'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@conneto.com');
        console.log('Password: AdminPassword123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
