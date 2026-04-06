const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
    const URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";
    await mongoose.connect(URI);
    const user = await User.findOne({ role: 'company' });
    if (!user) {
        console.log('No company user found.');
    } else {
        console.log('User:', user.name);
        console.log('Documents count:', user.companyDocuments.length);
        user.companyDocuments.forEach((doc, i) => {
            console.log(`Doc ${i}: Name=${doc.docName}, HasData=${!!doc.docData}, ContentType=${doc.contentType}, ID=${doc._id}`);
        });
    }
    await mongoose.disconnect();
}

check();
