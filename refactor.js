const fs = require('fs');
const files = ['views/index.ejs', 'views/about.ejs', 'views/contact.ejs'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Replace :root block with theme-aware block
    content = content.replace(/:root\s*\{[\s\S]*?--text-muted:\s*#888;\s*\}/, `:root {
            --bg-dark: #ffffff;
            --bg-darker: #f1f5f9;
            --accent: #2563eb;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --nav-bg: rgba(255, 255, 255, 0.9);
            --card-bg: #ffffff;
        }
        [data-theme="dark"] {
            --bg-dark: #030a16;
            --bg-darker: #01050b;
            --accent: #38bdf8;
            --text-main: #f4f4f5;
            --text-muted: #888;
            --border-color: rgba(255, 255, 255, 0.05);
            --nav-bg: rgba(3, 10, 22, 0.9);
            --card-bg: rgba(255, 255, 255, 0.03);
        }`);

    // Replace hardcoded white texts
    content = content.replace(/color:\s*#ffffff\s*!important/g, 'color: var(--text-main) !important');
    content = content.replace(/color:\s*#fff/g, 'color: var(--text-main)');
    content = content.replace(/color:\s*#ccc/g, 'color: var(--text-muted)');

    // Replace hardcoded border colors
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--border-color)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--border-color)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.25\)/g, 'var(--border-color)');

    // Replace nav backgrounds
    content = content.replace(/background:\s*rgba\(3,\s*10,\s*22,\s*0\.9\)/g, 'background: var(--nav-bg)');

    // Search container backgrounds
    content = content.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'background: var(--card-bg)');

    // Fix hamburger white background
    content = content.replace(/\.c-hamburger-home span\s*\{\s*display:\s*block;\s*width:\s*22px;\s*height:\s*2px;\s*background:\s*#fff/g, '.c-hamburger-home span { display: block; width: 22px; height: 2px; background: var(--text-main)');

    // Ensure body transition
    if (!content.includes('transition: background-color 0.3s')) {
        content = content.replace(/body\s*\{(.*?)\}/, 'body {$1 transition: background-color 0.3s, color 0.3s; }');
    }

    // Inject Theme toggle button before </body> if missing. 
    // Wait, index.ejs HAS toggle button but about.ejs and contact.ejs don't.
    // Actually, I'll just remove any existing toggle button and script, then append them cleanly.
    content = content.replace(/<!-- Floating Theme Toggle Button -->[\s\S]*?<\/body>/, '</body>');

    if (!content.includes('class="c-theme-toggle"')) {
        content = content.replace('</body>', `
    <!-- Floating Theme Toggle Button -->
    <button class="c-theme-toggle" onclick="toggleTheme()" title="Toggle dark/light mode" aria-label="Toggle theme">
        <i class="fas fa-sun icon-sun"></i>
        <i class="fas fa-moon icon-moon"></i>
    </button>
    <script>
        (function () {
            var saved = localStorage.getItem('conneto-theme');
            if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        })();
        function toggleTheme() {
            var html = document.documentElement;
            var isDark = html.getAttribute('data-theme') === 'dark';
            if (isDark) {
                html.removeAttribute('data-theme');
                localStorage.setItem('conneto-theme', 'light');
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('conneto-theme', 'dark');
            }
        }
    </script>
</body>`);
    }

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Done refactoring EJS files');
