const mongoose = require('mongoose');
const uri = 'mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster';
mongoose.connect(uri).then(async () => {
    const User = require('../models/User');
    const result = await User.findOneAndUpdate(
        { email: 'ani@gmail.com' },
        { status: 'Approved' },
        { new: true }
    );
    if (result) {
        console.log('UPDATED:', JSON.stringify({ name: result.name, email: result.email, role: result.role, status: result.status }, null, 2));
    } else {
        console.log('NOT FOUND');
    }
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
