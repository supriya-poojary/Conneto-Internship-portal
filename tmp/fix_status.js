const fs = require('fs');
let content = fs.readFileSync('views/dashboard/student.ejs', 'utf-8');

// 1. Fix the counters
content = content.replace(
    /a\.status === 'Shortlisted' \|\| a\.status === 'Selected'/g,
    "['shortlisted', 'selected', 'interview_scheduled'].includes(a.status)"
);

content = content.replace(
    /a\.status === 'Rejected'/g,
    "a.status === 'rejected'"
);

// 2. Fix the badge rendering (two occurrences)
const oldBadgeLogic = `<% if(app.status === 'Applied') { %> <span class="badge badge-pending">Applied</span>
                                            <% } else if(app.status === 'Reviewing') { %> <span class="badge badge-review">Under Review</span>
                                            <% } else if(app.status === 'Shortlisted' || app.status === 'Selected') { %> <span class="badge badge-shortlist"><%= app.status %></span>
                                            <% } else { %> <span class="badge badge-reject">Rejected</span> <% } %>`;

const newBadgeLogic = `<% if(app.status === 'applied') { %> <span class="badge badge-pending">Applied</span>
                                            <% } else if(app.status === 'under_review') { %> <span class="badge badge-review">Under Review</span>
                                            <% } else if(['shortlisted', 'selected', 'interview_scheduled'].includes(app.status)) { %> 
                                                <span class="badge badge-shortlist">
                                                    <%= app.status === 'interview_scheduled' ? 'Interview' : (app.status.charAt(0).toUpperCase() + app.status.slice(1)) %>
                                                </span>
                                            <% } else { %> <span class="badge badge-reject">Rejected</span> <% } %>`;

content = content.split(oldBadgeLogic).join(newBadgeLogic);

// Write changes
fs.writeFileSync('views/dashboard/student.ejs', content);
console.log('Fixed status case in student.ejs');
