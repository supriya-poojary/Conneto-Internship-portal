const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Internship = mongoose.model('Internship', new Schema({}), 'internships');
const Application = mongoose.model('Application', new Schema({}), 'applications');

async function clear() {
  const URI = "mongodb+srv://akankshaa412_db_user:VHGVJhg4hasdhaj@mongocluster.3whtc05.mongodb.net/conneto?retryWrites=true&w=majority&appName=Mongocluster";
  try {
    await mongoose.connect(URI);
    console.log('Connected to MongoDB');
    
    const intResult = await Internship.deleteMany({});
    console.log(`Deleted ${intResult.deletedCount} internships`);
    
    const appResult = await Application.deleteMany({});
    console.log(`Deleted ${appResult.deletedCount} applications`);
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clear();
