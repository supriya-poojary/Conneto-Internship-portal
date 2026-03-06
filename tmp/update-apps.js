const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const companyPath = path.join(rootDir, 'views', 'dashboard', 'company.ejs');
const appsPath = path.join(rootDir, 'views', 'company', 'applications.ejs');

let companyContent = fs.readFileSync(companyPath, 'utf8');
let appsContent = fs.readFileSync(appsPath, 'utf8');

// We will extract the <style> block from company.ejs 
// and the sidebar structure
const styleMatch = companyContent.match(/<style>([\s\S]*?)<\/style>/);
const sidebarMatch = companyContent.match(/<div class="sidebar-overlay" id="sidebarOverlay"><\/div>[\s\S]*?<aside class="sidebar" id="sidebar">[\s\S]*?<\/aside>/);

if (!styleMatch || !sidebarMatch) {
    console.error("Could not find style or sidebar in company.ejs");
    process.exit(1);
}

let companyStyles = styleMatch[1];
let sidebarHtml = sidebarMatch[0];

// Modify sidebarHtml to make the correct link active
sidebarHtml = sidebarHtml.replace(/<a href="\/company\/dashboard" class="sb-link active">/, '<a href="/company/dashboard" class="sb-link">');
sidebarHtml = sidebarHtml.replace(/<a href="\/company\/applications" class="sb-link">/, '<a href="/company/applications" class="sb-link active">');

// Custom Apps CSS for the row cards
const appsCustomCSS = `
        /* Apps Specific Horizontal Card */
        .app-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .app-row-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
            .app-row-card {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
            .app-main-info {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .app-details {
                flex: 2;
                display: flex;
                gap: 20px;
                border-left: 1px solid var(--border);
                border-top: none;
                padding-left: 20px;
                padding-top: 0;
                margin-left: 20px;
                margin-top: 0;
            }
            .app-actions {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
                border-left: 1px solid var(--border);
                border-top: none;
                padding-left: 20px;
                padding-top: 0;
                margin-left: 20px;
                margin-top: 0;
            }
        }

        .app-row-card:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .student-avatar {
            width: 60px;
            height: 60px;
            border-radius: 14px;
            background: rgba(124, 58, 237, 0.1);
            color: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            flex-shrink: 0;
        }

        .student-info h3 {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 5px;
        }

        .app-status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            display: inline-block;
            margin-top: 5px;
        }

        .status-applied { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
        .status-under_review { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-shortlisted { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .status-interview_scheduled { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-selected { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .btn-act {
            padding: 10px 15px;
            border-radius: 8px;
            border: none;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.25s;
            text-decoration: none;
            width: 100%;
        }

        .btn-act-shortlist { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
        .btn-act-shortlist:hover { background: #8b5cf6; color: #fff; }
        .btn-act-schedule { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .btn-act-schedule:hover { background: #10b981; color: #fff; }
        .btn-act-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .btn-act-reject:hover { background: #ef4444; color: #fff; }
        .btn-act-hire { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .btn-act-hire:hover { background: #22c55e; color: #fff; }

        .group-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border);
        }

        .group-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-main);
        }
        
        .skill-tag {
            padding: 4px 10px;
            background: rgba(124, 58, 237, 0.1);
            color: var(--accent);
            border-radius: 6px;
            font-size: 0.75rem;
            margin-right: 5px;
            display: inline-block;
            margin-bottom: 5px;
        }

        .empty-state {
            text-align: center;
            padding: 80px 20px;
            background: var(--bg-card);
            border-radius: 20px;
            border: 1px dashed var(--border);
        }
`;

// Extract inner body content of applications
// and replace it with new structure

const newAppsHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Applications | Conneto</title>
    <!-- Prevent FOUT -> Pre-load Theme -->
    <script>
        (function () {
            var saved = localStorage.getItem('conneto-theme');
            if (saved !== 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/css/conneto.css">
    <style>
        ${companyStyles}
        ${appsCustomCSS}
    </style>
</head>
<body>
    <!-- Theme auto-apply -->
    <script>
        (function () {
            var t = localStorage.getItem('conneto-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
        })();
    </script>

    ${sidebarHtml}

    <main class="main-content">
        <header class="topbar">
            <div style="display:flex; align-items:center; gap:16px;">
                <button id="sidebarToggleBtn"
                    style="display:flex; flex-direction:column; gap:5px; cursor:pointer; padding:8px; border-radius:8px; border:1.5px solid var(--border); background:rgba(255,255,255,0.04); color:#fff;"
                    aria-label="Menu">
                    <span style="display:block;width:20px;height:2px;background:currentColor;border-radius:2px;"></span>
                    <span style="display:block;width:20px;height:2px;background:currentColor;border-radius:2px;"></span>
                    <span style="display:block;width:20px;height:2px;background:currentColor;border-radius:2px;"></span>
                </button>
                <div>
                    <h1 style="font-size: 1.8rem; margin-bottom: 5px; color: var(--text-main);">Manage Applications</h1>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Review and hire top talents for your internships.</p>
                </div>
            </div>
            <!-- Missing user in context here but we can skip it or just put static / post internship btn -->
            <a href="/company/internships/create" class="sb-link" style="background: var(--accent); color: #fff; padding: 10px 20px;">
                <i class="fas fa-plus"></i> Post Internship
            </a>
        </header>

        <div style="margin-top: 30px;">
        <% if (groupedApplications && groupedApplications.length > 0) { %>
            <% groupedApplications.forEach(function(group, index) { %>
                <div style="margin-bottom: 50px;">
                    <div class="group-header">
                        <i class="fas fa-briefcase" style="font-size: 1.4rem; color: var(--accent);"></i>
                        <h2 class="group-title"><%= group.internship.title %></h2>
                        <span style="padding: 4px 12px; background: rgba(124, 58, 237, 0.1); color: var(--accent); border-radius: 50px; font-size: 0.85rem; font-weight: 700;">
                            <%= group.applications.length %> Applicant<%= group.applications.length !== 1 ? 's' : '' %>
                        </span>
                    </div>

                    <% if (group.applications && group.applications.length > 0) { %>
                        <div class="app-list">
                            <% group.applications.forEach(function(app) { %>
                                <div class="app-row-card">
                                    <div class="app-main-info">
                                        <div class="student-avatar">
                                            <%= app.student ? app.student.name.charAt(0).toUpperCase() : 'S' %>
                                        </div>
                                        <div class="student-info">
                                            <h3><%= app.student ? app.student.name : 'Unknown Student' %></h3>
                                            <p style="font-size: 0.85rem; color: var(--text-muted);">Applied: <%= new Date(app.appliedAt).toLocaleDateString() %></p>
                                            <span class="app-status status-<%= app.status %>">
                                                <%= app.status.replace('_', ' ') %>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="app-details">
                                        <div style="flex: 1;">
                                            <% if (app.extractedSkills && app.extractedSkills.length > 0) { %>
                                                <p style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom: 5px;">Skills Match</p>
                                                <div>
                                                    <% app.extractedSkills.forEach(skill => { %>
                                                        <span class="skill-tag"><%= skill %></span>
                                                    <% }) %>
                                                </div>
                                            <% } else if (app.studentSkills) { %>
                                                <p style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom: 5px;">Skills</p>
                                                <div>
                                                    <% app.studentSkills.split(',').forEach(skill => { %>
                                                        <span class="skill-tag"><%= skill.trim() %></span>
                                                    <% }) %>
                                                </div>
                                            <% } %>
                                        </div>
                                        <div style="flex: 1;">
                                            <% if (app.resumeUrl) { %>
                                                <a href="<%= app.resumeUrl %>" target="_blank" style="display:inline-flex; align-items:center; gap:8px; padding:8px 15px; background:rgba(37,99,235,0.1); color:#3b82f6; border-radius:8px; font-size:0.85rem; font-weight:600; text-decoration:none;">
                                                    <i class="fas fa-file-pdf" style="color:#ef4444;"></i> View Resume
                                                </a>
                                            <% } %>
                                        </div>
                                    </div>

                                    <div class="app-actions">
                                        <% if (app.status === 'applied' || app.status === 'under_review') { %>
                                            <form action="/company/applications/<%= app._id %>/shortlist" method="POST" style="margin:0;">
                                                <button type="submit" class="btn-act btn-act-shortlist">
                                                    <i class="fas fa-star"></i> Shortlist
                                                </button>
                                            </form>
                                            <button type="button" class="btn-act btn-act-schedule" onclick="openInterviewModal('<%= app._id %>')">
                                                <i class="fas fa-calendar"></i> Schedule
                                            </button>
                                            <form action="/company/applications/<%= app._id %>/reject" method="POST" style="margin:0;">
                                                <button type="submit" class="btn-act btn-act-reject">
                                                    <i class="fas fa-times"></i> Reject
                                                </button>
                                            </form>

                                        <% } else if (app.status === 'shortlisted') { %>
                                            <button type="button" class="btn-act btn-act-schedule" onclick="openInterviewModal('<%= app._id %>')">
                                                <i class="fas fa-calendar"></i> Interview
                                            </button>
                                            <form action="/company/applications/<%= app._id %>/select" method="POST" style="margin:0;">
                                                <button type="submit" class="btn-act btn-act-hire">
                                                    <i class="fas fa-user-check"></i> Hire
                                                </button>
                                            </form>

                                        <% } else if (app.status === 'interview_scheduled') { %>
                                            <form action="/company/applications/<%= app._id %>/select" method="POST" style="margin:0;">
                                                <button type="submit" class="btn-act btn-act-hire">
                                                    <i class="fas fa-award"></i> Select
                                                </button>
                                            </form>
                                            <form action="/company/applications/<%= app._id %>/reject" method="POST" style="margin:0;">
                                                <button type="submit" class="btn-act btn-act-reject">
                                                    <i class="fas fa-times"></i> Reject
                                                </button>
                                            </form>
                                        <% } else { %>
                                            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 10px;">
                                                No actions available
                                            </div>
                                        <% } %>
                                    </div>
                                </div>
                            <% }); %>
                        </div>
                    <% } else { %>
                        <div class="empty-state" style="padding: 40px; margin-top: 10px;">
                            <i class="fas fa-inbox"></i>
                            <p>No applications yet for this position.</p>
                        </div>
                    <% } %>
                </div>
            <% }); %>
        <% } else { %>
            <div class="empty-state">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--border); margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 10px;">No Applications Found</h3>
                <p style="color: var(--text-muted); margin-bottom: 25px;">You haven't received any applications for your active postings yet.</p>
                <a href="/company/internships/create" class="btn-act btn-act-shortlist" style="display: inline-flex; width: auto; padding: 12px 25px; background: var(--accent); color: #fff;">
                    <i class="fas fa-plus"></i> Post a New Internship
                </a>
            </div>
        <% } %>
        </div>
    </main>

    <!-- Interview Modal -->
    <div class="sidebar-overlay" id="interviewModal" style="display:none; align-items:center; justify-content:center; z-index: 1000; opacity: 1;">
        <div style="background: var(--bg-card); padding: 40px; border-radius: 20px; border: 1px solid var(--border); max-width: 450px; width: 90%; position: relative;">
            <h2 style="font-family: 'Poppins', sans-serif; font-size: 1.5rem; font-weight: 700; margin-bottom: 25px; color: var(--text-main);">Schedule Interview</h2>
            <form id="interviewForm" action="" method="POST">
                <label style="display:block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Select Date & Time</label>
                <input type="datetime-local" name="interviewDate" required style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 10px; margin-bottom: 20px; font-size: 0.95rem; background: rgba(255,255,255,0.03); color: var(--text-main);">
                
                <label style="display:block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Additional Notes (Optional)</label>
                <textarea name="interviewNote" placeholder="e.g. Google Meet link, what to prepare..." rows="3" style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 10px; margin-bottom: 20px; font-size: 0.95rem; background: rgba(255,255,255,0.03); color: var(--text-main);"></textarea>
                
                <div style="display: flex; gap: 15px; margin-top: 10px;">
                    <button type="button" onclick="closeInterviewModal()" style="flex: 1; padding: 12px; background: transparent; border: 2px solid var(--border); border-radius: 10px; font-weight: 600; color: var(--text-main); cursor: pointer;">Cancel</button>
                    <button type="submit" style="flex: 1; padding: 12px; background: var(--accent); color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Confirm Schedule</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Floating Theme Toggle -->
    <button class="c-theme-toggle" onclick="toggleTheme()" title="Toggle dark/light mode" aria-label="Toggle theme">
        <i class="fas fa-sun icon-sun"></i>
        <i class="fas fa-moon icon-moon"></i>
    </button>

    <script>
        function openInterviewModal(applicationId) {
            const modal = document.getElementById('interviewModal');
            const form = document.getElementById('interviewForm');
            form.action = '/company/applications/' + applicationId + '/interview';
            modal.style.display = 'flex';
        }

        function closeInterviewModal() {
            document.getElementById('interviewModal').style.display = 'none';
        }

        document.getElementById('interviewModal').addEventListener('click', function (e) {
            if (e.target === this) {
                closeInterviewModal();
            }
        });

        // Theme toggle logic synced with conneto.css
        function toggleTheme() {
            var html = document.documentElement;
            var current = html.getAttribute('data-theme') || 'dark';
            var next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('conneto-theme', next);
        }

        // Mobile sidebar toggle
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        const closeBtn = document.getElementById('closeSidebarBtn');

        function openSidebar() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
    </script>
</body>
</html>
`;

fs.writeFileSync(appsPath, newAppsHtml);
console.log('Successfully updated applications.ejs!');
