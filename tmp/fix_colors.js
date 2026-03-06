const fs = require('fs');

const files = [
    'views/index.ejs',
    'views/about.ejs',
    'views/dashboard/student.ejs'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // Fix accent color to be brighter light blue
    content = content.replace('--accent: #0075ff;', '--accent: #38bdf8;');

    // Fix headings to ensure they are white instead of inheriting dark Bootstrap text
    content = content.replace(
        "h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; font-weight: 400; }",
        "h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; font-weight: 400; color: #ffffff !important; }"
    );

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
