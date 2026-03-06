const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Fix create.ejs layout
try {
    const createPath = path.join(rootDir, 'views', 'internships', 'create.ejs');
    let createContent = fs.readFileSync(createPath, 'utf8');
    createContent = createContent.replace('max-width: 960px;', 'max-width: 1150px;');
    createContent = createContent.replace('grid-template-columns: 1fr 300px;', 'grid-template-columns: 1fr 350px;');
    fs.writeFileSync(createPath, createContent);
    console.log('Fixed create.ejs layout');
} catch (e) {
    console.error('Error fixing create.ejs:', e.message);
}

// 2. Fix company.ejs btn-icon
try {
    const companyPath = path.join(rootDir, 'views', 'dashboard', 'company.ejs');
    let companyContent = fs.readFileSync(companyPath, 'utf8');

    const btnIconCSS = `
        .applicant-role,
        .listing-role {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .btn-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .btn-icon:hover {
            background: var(--accent);
            border-color: var(--accent);
            transform: scale(1.05);
        }

        .status-badge {`;

    companyContent = companyContent.replace(/\.applicant-role,\s*\.listing-role\s*\{\s*font-size:\s*0\.85rem;\s*color:\s*var\(--text-muted\);\s*\}\s*\.status-badge\s*\{/, btnIconCSS);
    fs.writeFileSync(companyPath, companyContent);
    console.log('Fixed company.ejs btn-icon');
} catch (e) {
    console.error('Error fixing company.ejs:', e.message);
}
