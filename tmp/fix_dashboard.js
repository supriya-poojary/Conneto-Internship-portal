const fs = require('fs');
let content = fs.readFileSync('views/dashboard/student.ejs', 'utf-8');

// 1. Update CSS Theme to luxury navy instead of pitch black
content = content.replace('--bg-main: #020610;', '--bg-main: #030a16;');
content = content.replace('--bg-card: #050a14;', '--bg-card: #0a162d;');
content = content.replace('--bg-sidebar: #02050c;', '--bg-sidebar: #01050b;');
content = content.replace('--border: rgba(255,255,255,0.06);', '--border: rgba(255,255,255,0.1);');

// 2. Fix data bindings in "Overview" Tab (Recent Activity)
content = content.replace(
    /<%= app\.companyName %>/g,
    "<%= app.internship ? app.internship.companyName : 'Archived' %>"
);
content = content.replace(
    /<%= app\.role %>/g,
    "<%= app.internship ? app.internship.title : 'Deleted Role' %>"
);

// 3. Fix data bindings in "Applications" Tab (My Archive)
// Already handled above because it replaces globally.

// Wait, the location property in "Applications" tab was:
content = content.replace(
    /<%= app\.location \|\| 'Remote' %>/g,
    "<%= app.internship ? (app.internship.location || 'Remote') : 'Remote' %>"
);

// Write changes
fs.writeFileSync('views/dashboard/student.ejs', content);
console.log('Dashboard fixed');
