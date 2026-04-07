const mongoose = require('mongoose');
const uri = 'mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster';
mongoose.connect(uri).then(async () => {
    const User = require('../models/User');
    const user = await User.findOne({ email: 'ani@gmail.com' });
    if (user) {
        console.log('FOUND:', JSON.stringify({ name: user.name, email: user.email, role: user.role, status: user.status, hasPassword: !!user.password }, null, 2));
    } else {
        console.log('NOT FOUND: ani@gmail.com');
    }
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
