const fs = require('fs');
const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Student Dashboard | Conneto</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        :root {
            --bg-main: #020610;
            --bg-card: #050a14;
            --bg-sidebar: #02050c;
            --accent: #0075ff;
            --text-main: #f4f4f5;
            --text-muted: #888;
            --border: rgba(255,255,255,0.06);
            --sidebar-width: 280px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: var(--bg-main); color: var(--text-main); font-family: 'Inter', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; display: flex; min-height: 100vh; }
        
        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; font-weight: 400; }
        a { color: inherit; text-decoration: none; }
        input, select, textarea { font-family: 'Inter', sans-serif; }
        button { cursor: pointer; font-family: 'Inter', sans-serif; }

        /* Sidebar */
        .sidebar { width: var(--sidebar-width); background: var(--bg-sidebar); border-right: 1px solid var(--border); position: fixed; height: 100vh; display: flex; flex-direction: column; z-index: 100; transition: transform 0.3s ease; }
        .sb-header { padding: 30px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .sb-logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: #fff; letter-spacing: 1px; }
        .sb-logo span { color: var(--accent); font-style: italic; }
        
        .sb-menu { flex: 1; padding: 30px 20px; display: flex; flex-direction: column; gap: 10px; }
        .sb-link { display: flex; align-items: center; gap: 14px; padding: 14px 20px; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 8px; transition: all 0.3s; }
        .sb-link svg { width: 18px; fill: currentColor; }
        .sb-link:hover { color: #fff; background: rgba(255,255,255,0.03); }
        .sb-link.active { color: #fff; background: rgba(0, 117, 255, 0.1); border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; }
        
        .sb-footer { padding: 30px 20px; border-top: 1px solid var(--border); }

        /* Main Content */
        .main-content { flex: 1; margin-left: var(--sidebar-width); padding: 40px 60px; min-height: 100vh; display: flex; flex-direction: column; transition: margin 0.3s ease; }
        
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
        .page-title { font-size: 2.2rem; font-weight: 400; letter-spacing: 0.02em; }
        .page-title span { color: var(--accent); font-style: italic; }
        
        .user-widget { display: flex; align-items: center; gap: 15px; }
        .user-avt { width: 44px; height: 44px; background: rgba(0, 117, 255, 0.15); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-family: 'Playfair Display', serif; font-weight: 600; border: 1px solid rgba(0,117,255,0.3); }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; font-size: 0.95rem; }
        .user-role { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

        /* Tab Logic */
        .tab-pane { display: none; opacity: 0; }
        .tab-pane.active { display: block; opacity: 1; }

        /* Forms & Cards */
        .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 40px; }
        .card-header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .card-title { font-size: 1.4rem; font-weight: 400; }
        .card-desc { color: var(--text-muted); font-size: 0.9rem; margin-top: 5px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 500; }
        .form-control { background: rgba(255,255,255,0.02); border: 1px solid var(--border); color: #fff; padding: 14px 18px; border-radius: 6px; font-size: 0.95rem; outline: none; transition: border-color 0.3s; }
        .form-control:focus { border-color: var(--accent); background: rgba(0,117,255,0.02); }
        textarea.form-control { resize: vertical; min-height: 120px; }

        .btn { display: inline-flex; align-items: center; gap: 10px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 500; color: #fff; padding: 14px 30px; border-radius: 4px; border: 1px solid var(--border); transition: all 0.3s; background: transparent; }
        .btn:hover { background: #fff; color: var(--bg-main); border-color: #fff; }
        .btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        .btn-primary:hover { background: #005ecc; border-color: #005ecc; color: #fff; }
        .btn-danger { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444; }
        .btn-danger:hover { background: #ef4444; color: #fff; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 30px; display: flex; flex-direction: column; gap: 15px; }
        .stat-val { font-family: 'Playfair Display', serif; font-size: 3rem; line-height: 1; color: #fff; }
        .stat-lbl { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        .stat-icon { width: 40px; height: 40px; background: rgba(0,117,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent); }

        /* Table */
        .table-responsive { width: 100%; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 15px 20px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
        td { padding: 20px; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.01); }
        
        .badge { padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; border: 1px solid transparent; }
        .badge-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
        .badge-review { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); }
        .badge-shortlist { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        .badge-reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        
        .empty-state { padding: 60px 0; text-align: center; }
        .empty-state svg { width: 64px; fill: var(--border); margin-bottom: 20px; }

        /* Responsive menu */
        .menu-toggle { display: none; background: transparent; border: 1px solid var(--border); color: #fff; width: 44px; height: 44px; border-radius: 6px; align-items: center; justify-content: center; }
        .menu-toggle svg { width: 24px; fill: currentColor; }

        @media (max-width: 1024px) {
            .sidebar { transform: translateX(-100%); width: 260px; }
            .sidebar.mobile-open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.5); }
            .main-content { margin-left: 0; padding: 30px 20px; }
            .menu-toggle { display: flex; }
            .form-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sb-header">
            <a href="/" class="sb-logo">Con<span>neto</span></a>
            <button class="menu-toggle d-lg-none" id="closeSidebar" style="border:none;">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        </div>
        <div class="sb-menu">
            <a href="#" class="sb-link active" data-tab="overview">
                <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                Overview
            </a>
            <a href="#" class="sb-link" data-tab="applications">
                <svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                My Applications
            </a>
            <a href="#" class="sb-link" data-tab="profile">
                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                Profile Setup
            </a>
            <a href="#" class="sb-link" data-tab="settings">
                <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                Settings
            </a>
            <a href="/internships" class="sb-link" style="margin-top:auto;">
                <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                Explore More
            </a>
        </div>
        <div class="sb-footer">
            <a href="/auth/logout" class="sb-link">
                <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                Disconnect
            </a>
        </div>
    </aside>

    <main class="main-content">
        <!-- Topbar -->
        <div class="topbar">
            <button class="menu-toggle" id="openSidebar">
                <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            </button>
            <div class="user-widget ms-auto">
                <div class="user-info text-end">
                    <span class="user-name"><%= user.name %></span>
                    <span class="user-role">Student</span>
                </div>
                <div class="user-avt"><%= user.name[0].toUpperCase() %></div>
            </div>
        </div>

        <% 
            var totalApps = applications ? applications.length : 0;
            var shortlists = applications ? applications.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length : 0;
            var rejections = applications ? applications.filter(a => a.status === 'Rejected').length : 0;
            var hasProfile = user.profile && user.profile.fullName ? true : false;
        %>

        <!-- OVERVIEW TAB -->
        <div class="tab-pane active gsap-fadein" id="overview">
            <h1 class="page-title mb-2">Welcome <span><%= user.name.split(' ')[0] %></span>.</h1>
            <p style="color:var(--text-muted); margin-bottom: 40px; font-weight:300;">Elevating your career trajectory begins here.</p>

            <% if(!hasProfile) { %>
                <div class="card mb-4" style="border-color: var(--accent); background: rgba(0,117,255,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="color:#fff; margin-bottom: 10px;">Incomplete Profile</h4>
                            <p style="color:var(--text-muted); font-size:0.9rem;">To apply for premium internships, a completed profile is required.</p>
                        </div>
                        <button class="btn btn-primary" onclick="switchTab('profile')">Complete Now</button>
                    </div>
                </div>
            <% } %>

            <div class="stats-grid">
                <div class="stat-card">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="stat-lbl">Total Applications</span>
                        <div class="stat-icon"><svg viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div>
                    </div>
                    <div class="stat-val"><%= totalApps %></div>
                </div>
                <div class="stat-card">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="stat-lbl">Shortlisted</span>
                        <div class="stat-icon" style="color:#10b981; background:rgba(16,185,129,0.1);"><svg viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg></div>
                    </div>
                    <div class="stat-val"><%= shortlists %></div>
                </div>
                <div class="stat-card">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="stat-lbl">Rejected</span>
                        <div class="stat-icon" style="color:#ef4444; background:rgba(239,68,68,0.1);"><svg viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>
                    </div>
                    <div class="stat-val"><%= rejections %></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Activity</h3>
                </div>
                <% if(applications && applications.length > 0) { %>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Date Applied</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <% applications.slice(0, 5).forEach(function(app) { %>
                                    <tr>
                                        <td style="font-weight:600;"><%= app.companyName %></td>
                                        <td><%= app.role %></td>
                                        <td style="color:var(--text-muted);"><%= new Date(app.appliedAt).toLocaleDateString() %></td>
                                        <td>
                                            <% if(app.status === 'Applied') { %> <span class="badge badge-pending">Applied</span>
                                            <% } else if(app.status === 'Reviewing') { %> <span class="badge badge-review">Under Review</span>
                                            <% } else if(app.status === 'Shortlisted' || app.status === 'Selected') { %> <span class="badge badge-shortlist"><%= app.status %></span>
                                            <% } else { %> <span class="badge badge-reject">Rejected</span> <% } %>
                                        </td>
                                    </tr>
                                <% }) %>
                            </tbody>
                        </table>
                    </div>
                <% } else { %>
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                        <p style="color:var(--text-muted); margin-bottom:20px;">No applications yet.</p>
                        <a href="/internships" class="btn btn-primary">Find Opportunities</a>
                    </div>
                <% } %>
            </div>
        </div>

        <!-- APPLICATIONS TAB -->
        <div class="tab-pane gsap-fadein" id="applications">
            <h1 class="page-title mb-5">My <span>Archive</span>.</h1>
            <div class="card">
                <% if(applications && applications.length > 0) { %>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                    <th>Date Applied</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <% applications.forEach(function(app) { %>
                                    <tr>
                                        <td style="font-weight:600;"><%= app.companyName %></td>
                                        <td><%= app.role %></td>
                                        <td><%= app.location || 'Remote' %></td>
                                        <td style="color:var(--text-muted);"><%= new Date(app.appliedAt).toLocaleDateString() %></td>
                                        <td>
                                            <% if(app.status === 'Applied') { %> <span class="badge badge-pending">Applied</span>
                                            <% } else if(app.status === 'Reviewing') { %> <span class="badge badge-review">Under Review</span>
                                            <% } else if(app.status === 'Shortlisted' || app.status === 'Selected') { %> <span class="badge badge-shortlist"><%= app.status %></span>
                                            <% } else { %> <span class="badge badge-reject">Rejected</span> <% } %>
                                        </td>
                                    </tr>
                                <% }) %>
                            </tbody>
                        </table>
                    </div>
                <% } else { %>
                    <div class="empty-state">
                        <p style="color:var(--text-muted); margin-bottom:20px;">Your archive is empty.</p>
                        <a href="/internships" class="btn btn-primary">Explore Internships</a>
                    </div>
                <% } %>
            </div>
        </div>

        <!-- PROFILE TAB -->
        <div class="tab-pane gsap-fadein" id="profile">
            <h1 class="page-title mb-5">Professional <span>Identity</span>.</h1>
            <div class="card">
                <form action="/student/profile" method="POST">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="fullName" class="form-control" value="<%= user.profile?.fullName || user.name %>" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" name="phone" class="form-control" value="<%= user.profile?.phone || '' %>" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Institution</label>
                            <input type="text" name="collegeName" class="form-control" value="<%= user.profile?.collegeName || '' %>" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Degree</label>
                            <input type="text" name="degree" class="form-control" value="<%= user.profile?.degree || '' %>" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Graduation Year</label>
                            <input type="number" name="graduationYear" class="form-control" value="<%= user.profile?.graduationYear || '' %>" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" name="location" class="form-control" value="<%= user.profile?.location || '' %>" required>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label class="form-label">Professional Core Skills (Comma Separated)</label>
                            <input type="text" name="skills" class="form-control" value="<%= user.profile && user.profile.skills ? user.profile.skills.join(', ') : '' %>" required>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label class="form-label">Professional Summary</label>
                            <textarea name="bio" class="form-control" rows="4"><%= user.profile?.bio || '' %></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">LinkedIn Ref</label>
                            <input type="url" name="linkedin" class="form-control" value="<%= user.profile?.linkedin || '' %>">
                        </div>
                        <div class="form-group">
                            <label class="form-label">GitHub Ref</label>
                            <input type="url" name="github" class="form-control" value="<%= user.profile?.github || '' %>">
                        </div>
                    </div>
                    <div style="margin-top: 40px; text-align: right;">
                        <button type="submit" class="btn btn-primary">Update Architecture</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- SETTINGS TAB -->
        <div class="tab-pane gsap-fadein" id="settings">
            <h1 class="page-title mb-5">System <span>Preferences</span>.</h1>
            <div class="card mb-4">
                <div class="card-header"><h3 class="card-title">Security Parameters</h3></div>
                <form action="/student/settings" method="POST">
                    <div class="form-grid">
                        <div class="form-group" style="grid-column: 1/-1;">
                            <label class="form-label">Current Configuration</label>
                            <input type="password" name="currentPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">New Credential</label>
                            <input type="password" name="newPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm Credential</label>
                            <input type="password" name="confirmPassword" class="form-control" required>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top:20px;">
                        <button type="submit" class="btn btn-primary">Lock Changes</button>
                    </div>
                </form>
            </div>
        </div>

    </main>

    <!-- GSAP for animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script>
        // Sidebar Toggle
        const sidebar = document.getElementById('sidebar');
        document.getElementById('openSidebar').addEventListener('click', () => sidebar.classList.add('mobile-open'));
        document.getElementById('closeSidebar').addEventListener('click', () => sidebar.classList.remove('mobile-open'));

        // Tabs Logic with GSAP
        const links = document.querySelectorAll('.sb-link[data-tab]');
        const panes = document.querySelectorAll('.tab-pane');

        function switchTab(tabId) {
            links.forEach(l => l.classList.remove('active'));
            document.querySelector('.sb-link[data-tab="' + tabId + '"]')?.classList.add('active');

            panes.forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            const activePane = document.getElementById(tabId);
            if(activePane) {
                activePane.style.display = 'block';
                activePane.classList.add('active');
                
                // Entry animation
                gsap.fromTo(activePane, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );
            }
            if(window.innerWidth <= 1024) {
                sidebar.classList.remove('mobile-open');
            }
        }

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab(link.getAttribute('data-tab'));
            });
        });

        // Initial Load animation
        window.onload = () => {
            gsap.from(".sidebar", { x: -280, duration: 0.8, ease: "power3.out" });
            gsap.from(".topbar", { y: -50, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
            gsap.from("#overview", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.4 });
        };
    </script>
</body>
</html>`;
fs.writeFileSync('views/dashboard/student.ejs', content);
