const fs = require('fs');
const path = require('path');

const appsPath = path.join(process.cwd(), 'views', 'company', 'applications.ejs');
let content = fs.readFileSync(appsPath, 'utf8');

// 1. Add CSS
const modalCSS = `
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 30px;
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            overflow-y: auto;
            padding: 40px;
            position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 20px;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-main);
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 1.5rem;
            cursor: pointer;
        }
        .close-btn:hover { color: var(--danger); transform: scale(1.1); }

        /* Profile Details in Modal */
        .profile-section {
            margin-top: 30px;
            padding: 25px;
            background: rgba(139, 92, 246, 0.03); /* Subtle accent bg */
            border-radius: 20px;
            border: 1px solid var(--border);
        }

        .profile-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--accent);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .profile-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .profile-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .profile-value {
            font-size: 0.95rem;
            color: var(--text-main);
        }
`;

if (!content.includes('.modal-content {')) {
    content = content.replace('</style>', modalCSS + '\n    </style>');
}

// 2. Add onclick to .app-row-card and cursor pointer
content = content.replace(/<div class="app-row-card">/g, '<div class="app-row-card" style="cursor: pointer;" onclick="openProfileModal(\'<%= app._id %>\')">');

// Stop clicks on buttons/links from propagating to the row
content = content.replace(/<div class="app-actions">/g, '<div class="app-actions" onclick="event.stopPropagation()">');
content = content.replace(/<div class="app-details">/g, '<div class="app-details" onclick="event.stopPropagation()">');

// 3. Add modal container HTML
const modalHTML = `
    <!-- Student Profile Modal -->
    <div id="profileModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Student Candidate Profile</h2>
                <button class="close-btn" onclick="closeProfileModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="profileModalBody">
                <!-- Injected via JS -->
            </div>
        </div>
    </div>
`;
if (!content.includes('id="profileModal"')) {
    content = content.replace('<!-- Interview Modal -->', modalHTML + '\n    <!-- Interview Modal -->');
}

// 4. Add JS data mapper and function
const scriptJS = `
    <script>
        // Data Store for Modals
        const applicantsData = {};
        <% if (groupedApplications && groupedApplications.length > 0) { %>
            <% groupedApplications.forEach(function(group) { %>
                <% if (group.applications && group.applications.length > 0) { %>
                    <% group.applications.forEach(function(app) { %>
                        applicantsData['<%= app._id %>'] = <%- JSON.stringify(app) %>;
                        // Add internship title for reference
                        applicantsData['<%= app._id %>'].internshipTitle = "<%= group.internship.title %>";
                    <% }); %>
                <% } %>
            <% }); %>
        <% } %>

        function openProfileModal(appId) {
            const app = applicantsData[appId];
            if (!app) return;

            const modal = document.getElementById('profileModal');
            const modalBody = document.getElementById('profileModalBody');

            const student = app.student || {};
            const profile = student.profile || {};

            // Merge skills
            const profileSkillsArr = (profile.skills && Array.isArray(profile.skills)) ? profile.skills : (profile.skills ? profile.skills.split(',') : []);
            const appSkillsArr = app.studentSkills ? app.studentSkills.split(',') : [];
            const allSkills = [...new Set([...profileSkillsArr, ...appSkillsArr].map(s => s.trim()).filter(s => s))];

            modalBody.innerHTML = \`
                <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;background:rgba(139,92,246,0.05);padding:24px;border-radius:18px;border:1px solid var(--border);flex-wrap:wrap;">
                    <div style="width:72px;height:72px;border-radius:18px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;flex-shrink:0;">
                        \${student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <h3 style="font-size:1.4rem;margin-bottom:4px;color:var(--text-main);">\${student.name || 'Unknown'}</h3>
                        <p style="color:var(--accent);font-weight:600;font-size:0.88rem;margin-bottom:8px;">\${app.internshipTitle || 'Applicant'}</p>
                        <div style="display:flex;flex-wrap:wrap;gap:10px;">
                            \${student.email ? \`<span style="font-size:0.8rem;color:var(--text-muted);"><i class="fas fa-envelope" style="margin-right:4px;"></i>\${student.email}</span>\` : ''}
                            \${profile.phone ? \`<span style="font-size:0.8rem;color:var(--text-muted);"><i class="fas fa-phone" style="margin-right:4px;"></i>\${profile.phone}</span>\` : ''}
                        </div>
                    </div>
                    <span class="status-badge \${app.status}" style="padding:8px 16px;border-radius:10px;font-size:0.75rem;flex-shrink:0; font-weight:700; text-transform:uppercase;">
                        \${app.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div class="profile-grid" style="margin-bottom:18px;">
                    <div class="profile-item">
                        <span class="profile-label">Education</span>
                        <span class="profile-value">\${profile.degree || 'Not provided'}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Institution</span>
                        <span class="profile-value">\${profile.college || 'Not provided'}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Applied On</span>
                        <span class="profile-value">\${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">CGPA / Year</span>
                        <span class="profile-value">\${profile.cgpa || profile.year || 'Not provided'}</span>
                    </div>
                </div>

                <div class="profile-section">
                    <h4 class="profile-title"><i class="fas fa-user"></i>About the Student</h4>
                    <p style="line-height:1.8;font-size:0.88rem;color:var(--text-muted);margin:0;">\${profile.bio || 'No bio added to their profile yet.'}</p>
                </div>

                <div class="profile-section">
                    <h4 class="profile-title"><i class="fas fa-code"></i>Skills</h4>
                    \${allSkills.length > 0
                    ? \`<div style="display:flex;flex-wrap:wrap;gap:8px;">\${allSkills.map(s => \`<span class="skill-tag">\${s}</span>\`).join('')}</div>\`
                    : \`<p style="color:var(--text-muted);font-size:0.85rem;margin:0;">No skills listed.</p>\`
                }
                </div>

                <div class="profile-section" style="background:rgba(14, 165, 233, 0.04);">
                    <h4 class="profile-title" style="color:#0ea5e9;"><i class="fas fa-comments"></i>Application Responses</h4>
                    <div style="margin-bottom:14px;">
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:#0ea5e9;margin:0 0 5px 0;font-weight:700;">Why should they be hired?</p>
                        <p style="font-size:0.88rem;line-height:1.7;color:var(--text-muted);margin:0;">\${app.question1Answer || 'No answer provided.'}</p>
                    </div>
                    <div>\${app.question2Answer ? \`
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:#0ea5e9;margin:0 0 5px 0;font-weight:700;">Availability</p>
                        <p style="font-size:0.88rem;line-height:1.7;color:var(--text-muted);margin:0;">\${app.question2Answer}</p>\` : ''
                }
                    </div>
                    \${app.coverLetter ? \`
                    <div style="margin-top:12px;">
                        <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:#0ea5e9;margin:0 0 5px 0;font-weight:700;">Cover Letter</p>
                        <p style="font-size:0.88rem;line-height:1.7;color:var(--text-muted);margin:0;">\${app.coverLetter}</p>
                    </div>\` : ''}
                </div>

                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
                    \${app.resumeUrl
                    ? \`<a href="\${app.resumeUrl}" target="_blank" style="flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:var(--accent);color:#fff;border-radius:11px;font-weight:700;font-size:0.85rem;text-decoration:none;transition:all 0.3s;"><i class="fas fa-file-pdf" style="color:#fff;"></i> View Resume</a>\`
                    : \`<div style="flex:1;min-width:120px;padding:12px;background:var(--bg-card);border:1px dashed var(--border);border-radius:11px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No Resume</div>\`
                }
                    \${profile.linkedin ? \`<a href="\${profile.linkedin}" target="_blank" style="width:46px;height:46px;background:#0A66C2;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;"><i class="fab fa-linkedin-in"></i></a>\` : ''}
                    \${profile.github ? \`<a href="\${profile.github}" target="_blank" style="width:46px;height:46px;background:#24292e;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;"><i class="fab fa-github"></i></a>\` : ''}
                    \${profile.portfolio ? \`<a href="\${profile.portfolio}" target="_blank" style="width:46px;height:46px;background:#7c3aed;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;"><i class="fas fa-globe"></i></a>\` : ''}
                </div>
            \`;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeProfileModal() {
            document.getElementById('profileModal').style.display = 'none';
            document.body.style.overflow = 'auto'; // restore scrolling
        }

        window.addEventListener('click', function(event) {
            const modal = document.getElementById('profileModal');
            if (event.target == modal) {
                closeProfileModal();
            }
        });
`;

if (!content.includes('function openProfileModal(appId)')) {
    content = content.replace('<script>', scriptJS + '\n    ');
}

fs.writeFileSync(appsPath, content);
console.log('Injected profile modal logic successfully into applications.ejs');
