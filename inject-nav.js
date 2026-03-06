const fs = require('fs');
const files = ['views/index.ejs', 'views/about.ejs', 'views/contact.ejs'];

const drawerHTML = `
    <!-- Mobile Nav Drawer -->
    <div class="home-mobile-nav" id="homeMobileNav">
        <div class="home-mobile-overlay" onclick="closeHomeDrawer()"></div>
        <div class="home-mobile-drawer" id="homeMobileDrawer">
            <div class="home-drawer-header">
                <div class="home-drawer-logo">Con<span>neto</span></div>
                <button class="home-drawer-close" onclick="closeHomeDrawer()">✕</button>
            </div>
            <div class="home-drawer-links">
                <a href="/"><i class="fas fa-home"></i> Home</a>
                <a href="/about"><i class="fas fa-info-circle"></i> About</a>
                <a href="/internships"><i class="fas fa-briefcase"></i> Internships</a>
                <a href="/contact"><i class="fas fa-envelope"></i> Contact</a>
            </div>
            <div class="home-drawer-footer">
                <% if(user){ %>
                    <a href="/<%= user.role %>/dashboard" class="btn-solid-mobile"><i class="fas fa-th-large"></i> Dashboard</a>
                    <a href="/auth/logout" class="btn-ghost-mobile"><i class="fas fa-sign-out-alt"></i> Logout</a>
                <% } else { %>
                    <a href="/auth/login" class="btn-ghost-mobile"><i class="fas fa-sign-in-alt"></i> Login</a>
                    <a href="/auth/register" class="btn-solid-mobile"><i class="fas fa-rocket"></i> Get Started</a>
                <% } %>
            </div>
        </div>
    </div>`;

const navToggleFuncs = `
        function openHomeDrawer() {
            document.getElementById('homeMobileNav').classList.add('open');
            document.getElementById('homeMobileDrawer').classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeHomeDrawer() {
            document.getElementById('homeMobileNav').classList.remove('open');
            document.getElementById('homeMobileDrawer').classList.remove('open');
            document.body.style.overflow = '';
        }
`;

const hamburgerHTML = `
            <!-- Hamburger (mobile only) -->
            <button class="c-hamburger-home" id="homeHamburger" onclick="openHomeDrawer()" aria-label="Open menu">
                <span></span><span></span><span></span>
            </button>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Inject Drawer before </body> if missing
    if (!content.includes('id="homeMobileNav"')) {
        // Remove old mobile navs if exist (especially in contact.ejs)
        content = content.replace(/<div id="mobileNav"[\s\S]*?<\/div>/, '');
        content = content.replace('</body>', drawerHTML + '\n</body>');
    }

    // 2. Inject JS functions before </body>
    if (!content.includes('function openHomeDrawer()')) {
        content = content.replace('</script>\n</body>', navToggleFuncs + '\n</script>\n</body>');
        content = content.replace('</script></body>', navToggleFuncs + '\n</script>\n</body>');
    }

    // 3. Replace/Add Hamburger
    if (!content.includes('class="c-hamburger-home"')) {
        // Find .c-nav-actions or nav-auth but try to be generic
        if (content.includes('class="c-nav-actions"')) {
            content = content.replace(/(<div class="c-nav-actions"[\s\S]*?)<\/div>/, `$1${hamburgerHTML}\n            </div>`);
        } else if (content.includes('class="conneto-nav-auth"')) {
            // Remove old hamburger if exists
            content = content.replace(/<button class="d-lg-none" id="mobileMenuBtn"[\s\S]*?<\/button>/, '');
            content = content.replace(/(<div class="conneto-nav-auth"[\s\S]*?)<\/div>/, `$1${hamburgerHTML}\n                    </div>`);
        }
    }

    // 4. Clean up redundant CSS if it matches the one we moved to conneto.css
    // But safely, let's just make sure conneto.css is linked
    if (!content.includes('href="/css/conneto.css"')) {
        content = content.replace('</head>', '<link rel="stylesheet" href="/css/conneto.css">\n</head>');
    }

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Global Navigation Injection Complete');
