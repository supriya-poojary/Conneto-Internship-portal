const fs = require('fs');
const path = require('path');

try {
    const companyPath = path.join(__dirname, '..', 'views', 'dashboard', 'company.ejs');
    let content = fs.readFileSync(companyPath, 'utf8');

    // Add missing detailsModal container right before scripts
    if (!content.includes('<div id="detailsModal"')) {
        const modalHtml = `
    <!-- Details Modal Container -->
    <div id="detailsModal" class="modal" style="display:-none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.6); align-items:center; justify-content:center; backdrop-filter:blur(4px);">
    </div>
        `;
        // Insert right before </main> or at end of body
        content = content.replace('</main>', '</main>' + modalHtml);
    }

    const cssPatch = `
        /* Overlay for mobile sidebar */
        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 90;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .sidebar-overlay.active {
            display: block;
            opacity: 1;
        }

        @media (min-width: 1025px) {
            #sidebarToggleBtn {
                display: none !important;
            }
            .mobile-close-btn {
                display: none !important;
            }
        }

        @media (max-width: 1024px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
                box-shadow: 5px 0 25px rgba(0,0,0,0.5);
            }

            .main-content {
                margin-left: 0;
                padding: 30px 15px; /* Better mobile padding */
            }

            .content-grid {
                grid-template-columns: 1fr !important;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
`;

    // Replace responsive block
    content = content.replace(/\/\* Responsive \*\/[\s\S]*?(?=\/\* Modal Transitions \*\/)/, cssPatch);

    // Add mobile close button to sidebar
    if (!content.includes('mobile-close-btn')) {
        content = content.replace('<div class="sb-header">', `<div class="sb-header">\n            <button class="mobile-close-btn" id="closeSidebarBtn" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>`);
    }

    // Add sidebar overlay to HTML
    if (!content.includes('sidebar-overlay')) {
        content = content.replace('<aside class="sidebar"', '<div class="sidebar-overlay" id="sidebarOverlay"></div>\n    <aside class="sidebar"');
    }

    // Update the JS
    const jsPatch = `
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
`;

    content = content.replace(/\/\/\s*Mobile sidebar toggle[\s\S]*?<\/script>/, jsPatch);

    fs.writeFileSync(companyPath, content);
    console.log('Mobile sidebar fixed!');
} catch (e) {
    console.error(e);
}
