const fs = require('fs');
const path = require('path');

function findEjsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findEjsFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.ejs')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allEjsFiles = findEjsFiles('views');

let updated = 0;
allEjsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // We want to add this to the head:
    const headScript = `\n    <!-- Prevent FOUT -> Pre-load Theme -->
    <script>
        (function () {
            var saved = localStorage.getItem('conneto-theme');
            if (saved !== 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script>\n`;

    // First, remove any existing bottom scripts if possible
    const searchPattern1 = /\(function\s*\(\)\s*\{\s*var\s*saved\s*=\s*localStorage\.getItem\('conneto-theme'\);\s*if\s*\(saved\s*!==\s*'light'\)\s*document\.documentElement\.setAttribute\('data-theme',\s*'dark'\);\s*\}\)\(\);/g;
    content = content.replace(searchPattern1, '');

    // Strip empty script tags
    content = content.replace(/<script>\s*<\/script>/g, '');

    if (content.includes('</head>') && !content.includes("Pre-load Theme")) {
        content = content.replace('</head>', headScript + '</head>');
        fs.writeFileSync(file, content, 'utf8');
        updated++;
    }
});
console.log(`Updated ${updated} files to include head script`);
