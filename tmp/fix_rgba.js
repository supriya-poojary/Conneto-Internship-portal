const fs = require('fs');

const files = [
    'views/index.ejs',
    'views/about.ejs',
    'views/dashboard/student.ejs'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // Replace hard-coded rgba for the old accent with the new one
    content = content.replace(/rgba\(0,\s*117,\s*255/g, 'rgba(56, 189, 248');

    fs.writeFileSync(file, content);
    console.log(`Updated RGBA in ${file}`);
});
