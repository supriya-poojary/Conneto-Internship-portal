const fs = require('fs');
const files = ['views/dashboard/company.ejs', 'views/dashboard/student.ejs'];

const toggleHTML = `
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
</body>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Verify if already contains toggle
    if (!content.includes('class="c-theme-toggle"')) {
        // Remove existing toggle if any malformed ones exist
        content = content.replace(/<!-- Floating Theme Toggle Button -->[\s\S]*?<\/body>/, '</body>');
        content = content.replace('</body>', toggleHTML);
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Injected theme toggle to dashboard files');
