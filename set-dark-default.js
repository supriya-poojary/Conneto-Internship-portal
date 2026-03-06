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

    // We want to replace the exact line:
    // if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    // with:
    // if (saved !== 'light') document.documentElement.setAttribute('data-theme', 'dark');

    if (content.includes("if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');")) {
        content = content.replace(
            "if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');",
            "if (saved !== 'light') document.documentElement.setAttribute('data-theme', 'dark');"
        );
        fs.writeFileSync(file, content, 'utf8');
        updated++;
    }
});
console.log(`Updated ${updated} files to default to dark mode`);
