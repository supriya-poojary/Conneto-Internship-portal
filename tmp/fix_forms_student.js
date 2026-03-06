const fs = require('fs');
const file = 'views/dashboard/student.ejs';

let content = fs.readFileSync(file, 'utf-8');

// 1. Add SweetAlert2 CDN to head
if (!content.includes('sweetalert2')) {
    content = content.replace(
        '</head>',
        '    <!-- SweetAlert2 -->\n    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>\n</head>'
    );
}

// 2. Add IDs to forms
content = content.replace('<form action="/student/profile" method="POST">', '<form id="profileForm" action="/student/profile" method="POST">');
content = content.replace('<form action="/student/settings" method="POST">', '<form id="settingsForm" action="/student/settings" method="POST">');

// 3. Add AJAX handling script
const ajaxScript = `
        // Form AJAX Handlers
        function handleFormSubmit(formId, successTitle, successText) {
            const form = document.getElementById(formId);
            if (!form) return;
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Show loading
                Swal.fire({
                    title: 'Processing...',
                    background: 'var(--bg-card)',
                    color: '#fff',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: successTitle,
                            text: result.message || successText,
                            background: 'var(--bg-card)',
                            color: '#fff',
                            confirmButtonColor: 'var(--accent)',
                            iconColor: 'var(--accent)'
                        });
                    } else {
                        throw new Error(result.error || 'Something went wrong');
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: error.message,
                        background: 'var(--bg-card)',
                        color: '#fff',
                        confirmButtonColor: '#ef4444'
                    });
                }
            });
        }

        handleFormSubmit('profileForm', 'Profile Updated!', 'Your professional identity has been saved.');
        handleFormSubmit('settingsForm', 'Security Updated!', 'Your credentials have been securely saved.');
`;

if (!content.includes('handleFormSubmit')) {
    content = content.replace(
        '// Initial Load animation',
        `${ajaxScript}\n        // Initial Load animation`
    );
}

fs.writeFileSync(file, content);
console.log('AJAX Profile/Settings forms added to student dashboard');
