const fs = require('fs');
const path = require('path');

const studentFile = path.resolve(__dirname, '../views/dashboard/student.ejs');
let content = fs.readFileSync(studentFile, 'utf8');

// 1. Add new CSS
const newCSS = `
        /* Sidebar Layout */
        .dashboard-container {
            display: flex;
            flex: 1;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
            padding: 24px;
            gap: 24px;
        }

        .sidebar {
            width: 280px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 24px 16px;
            box-shadow: var(--shadow);
            border: 1px solid rgba(255, 255, 255, 0.5);
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: sticky;
            top: 100px;
            height: fit-content;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            color: var(--text-muted);
        }
        .nav-item:hover, .nav-item.active {
            background: var(--primary-light);
            color: var(--primary);
        }
        .nav-item i { font-size: 1.2rem; width: 24px; text-align: center; }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 24px;
            min-width: 0;
        }

        .tab-pane {
            display: none;
            animation: fadeIn 0.4s ease;
        }
        .tab-pane.active {
            display: block;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Form Styles */
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 0.9rem; }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border);
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            background: #fff;
        }
        .form-group input:focus, .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-light);
        }
        .btn-primary {
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .alert {
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
            font-weight: 500;
        }
        .alert-success { background: var(--success-light); color: var(--success); display: block; }
        .alert-error { background: var(--danger-light); color: var(--danger); display: block; }
        
        @media (max-width: 900px) {
            .dashboard-container { flex-direction: column; }
            .sidebar { width: 100%; position: static; }
            .form-row { grid-template-columns: 1fr; }
        }
    </style>
`;
content = content.replace('</style>', newCSS);

// 2. Replace structure
const oldContainerStart = '<div class="container">';
const bodyContentMatch = content.match(/<div class="container">([\s\S]*?)<\/div>\s*<script>/);
if (!bodyContentMatch) {
    console.log("Could not find the container block");
    process.exit(1);
}

const oldDashboardHTML = bodyContentMatch[1];

const newContainerHTML = \`
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="profile-card" style="margin-top: 0; margin-bottom: 20px;">
                <div class="profile-avatar-large" style="width: 60px; height: 60px; font-size: 1.5rem;">
                    <%= user.name.charAt(0).toUpperCase() %>
                </div>
                <div class="profile-name"><%= user.name %></div>
                <span class="profile-status">Student</span>
            </div>
            
            <div class="sidebar-nav">
                <div class="nav-item active" data-tab="overview">
                    <i class="fas fa-home"></i> Overview
                </div>
                <div class="nav-item" data-tab="applications" onclick="window.location.href='/student/applications'">
                    <i class="fas fa-file-alt"></i> My Applications
                </div>
                <div class="nav-item" data-tab="profile">
                    <i class="fas fa-user-edit"></i> Edit Profile
                </div>
                <div class="nav-item" data-tab="settings">
                    <i class="fas fa-cog"></i> Settings
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Overview Tab -->
            <div class="tab-pane active" id="overview">
                \${oldDashboardHTML.replace(/<!-- Sidebar -->[\\s\\S]*?<!-- Profile Status -->[\\s\\S]*?<\/div>\\s*<\/div>\\s*<\/div>/, '</div></div>')}
                <!-- Removed right sidebar from old layout as it conflicts with new structure, will reconstruct if needed -->
            </div>

            <!-- Profile Tab -->
            <div class="tab-pane" id="profile">
                <div class="card" style="animation: none;">
                    <div class="card-header">
                        <h2 class="card-title"><i class="fas fa-user-edit"></i> Edit Profile</h2>
                    </div>
                    
                    <div id="profileAlert"></div>
                    
                    <form id="profileForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>College/University</label>
                                <input type="text" name="college" value="<%= profile.college || '' %>" placeholder="e.g. SRM University">
                            </div>
                            <div class="form-group">
                                <label>Location</label>
                                <input type="text" name="location" value="<%= profile.location || '' %>" placeholder="e.g. Bangalore, India">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Degree</label>
                                <input type="text" name="degree" value="<%= profile.degree || '' %>" placeholder="e.g. B.Tech">
                            </div>
                            <div class="form-group">
                                <label>Branch/Specialization</label>
                                <input type="text" name="branch" value="<%= profile.branch || '' %>" placeholder="e.g. Computer Science">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Graduation Year</label>
                                <input type="number" name="year" value="<%= profile.year || '' %>" placeholder="e.g. 2026">
                            </div>
                            <div class="form-group">
                                <label>CGPA / Percentage</label>
                                <input type="number" step="0.01" name="gpa" value="<%= profile.gpa || '' %>" placeholder="e.g. 8.5">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Skills (comma separated)</label>
                            <input type="text" name="skills" value="<%= profile.skills ? profile.skills.join(', ') : '' %>" placeholder="e.g. HTML, CSS, JavaScript, React">
                        </div>
                        <div class="form-group">
                            <label>Bio</label>
                            <textarea name="bio" rows="4" placeholder="Tell companies about yourself..."><%= profile.bio || '' %></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="text" name="phone" value="<%= profile.phone || '' %>" placeholder="+91 9876543210">
                            </div>
                            <div class="form-group">
                                <label>LinkedIn URL</label>
                                <input type="url" name="linkedin" value="<%= profile.linkedin || '' %>" placeholder="https://linkedin.com/in/username">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>GitHub URL</label>
                                <input type="url" name="github" value="<%= profile.github || '' %>" placeholder="https://github.com/username">
                            </div>
                        </div>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Save Profile
                        </button>
                    </form>
                </div>
            </div>

            <!-- Settings Tab -->
            <div class="tab-pane" id="settings">
                <div class="card" style="animation: none;">
                    <div class="card-header">
                        <h2 class="card-title"><i class="fas fa-cog"></i> Account Settings</h2>
                    </div>
                    
                    <div id="settingsAlert"></div>
                    
                    <form id="settingsForm">
                        <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: var(--text);">Change Password</h3>
                        <div class="form-group">
                            <label>Current Password</label>
                            <input type="password" name="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label>New Password</label>
                            <input type="password" name="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" name="confirmPassword" required minlength="6">
                        </div>
                        <button type="submit" class="btn-primary" style="background: var(--warning); color: #fff;">
                            <i class="fas fa-key"></i> Update Password
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>
    <script>
\`;

// Replace the old HTML structure
content = content.replace(/<div class="container">([\\s\\S]*?)<\/div>\\s*<script>/, newContainerHTML);

// 3. Add JS for Tabs and Forms
const tabJS = \`
        // Tab Switching Logic
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        const tabPanes = document.querySelectorAll('.tab-pane');

        function switchTab(tabId) {
            if(tabId === 'applications') return; // Handled by link
            
            navItems.forEach(item => {
                if (item.dataset.tab === tabId) item.classList.add('active');
                else item.classList.remove('active');
            });
            
            tabPanes.forEach(pane => {
                if (pane.id === tabId) pane.classList.add('active');
                else pane.classList.remove('active');
            });
            
            window.location.hash = tabId;
        }

        // Handle initial hash
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            if (['overview', 'profile', 'settings'].includes(hash)) {
                switchTab(hash);
            }
        }

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                switchTab(tabId);
            });
        });

        function showAlert(containerId, message, type) {
            const container = document.getElementById(containerId);
            container.innerHTML = \\\`<div class="alert alert-\\\${type}">\\\${message}</div>\\\`;
            setTimeout(() => { container.innerHTML = ''; }, 5000);
        }

        // Handle Profile Form Submit
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                const response = await fetch('/student/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showAlert('profileAlert', result.message, 'success');
                } else {
                    showAlert('profileAlert', result.error || 'Failed to save', 'error');
                }
            } catch (err) {
                showAlert('profileAlert', 'An error occurred', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        // Handle Settings Form Submit
        document.getElementById('settingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (data.newPassword !== data.confirmPassword) {
                showAlert('settingsAlert', 'New passwords do not match!', 'error');
                return;
            }

            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            btn.disabled = true;

            try {
                const response = await fetch('/student/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showAlert('settingsAlert', result.message, 'success');
                    e.target.reset();
                } else {
                    showAlert('settingsAlert', result.error || 'Failed to update', 'error');
                }
            } catch (err) {
                showAlert('settingsAlert', 'An error occurred', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
\`;
content = content.replace('<script>', '<script>' + "\\n" + tabJS);

// Save string to file directly
fs.writeFileSync(path.resolve(__dirname, '../../views/dashboard/student.ejs'), content);
console.log("Successfully replaced student.ejs contents!");
