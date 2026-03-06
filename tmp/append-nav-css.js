const fs = require('fs');
const cssPath = 'c:\\Users\\supri\\Documents\\Conneto-Internship-portal_new\\Conneto-Internship-portal\\public\\css\\conneto.css';

const appendCSS = `
/* Global Mobile Navigation Drawer */
.c-hamburger-home {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    border: 1.5px solid var(--border-color, rgba(255, 255, 255, 0.25));
    background: none;
    transition: all 0.3s;
}

.c-hamburger-home span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--text-main, #fff);
    border-radius: 2px;
    transition: all 0.3s;
}

@media (max-width: 991px) {
    .c-hamburger-home {
        display: flex !important;
    }
    .c-nav-inner {
        padding: 0 20px;
    }
    .c-nav-links {
        display: none !important;
    }
    /* Hide desktop auth buttons on mobile to make room for hamburger */
    .c-nav-actions .btn-luxury,
    .conneto-nav-auth .btn-nav-signup,
    .conneto-nav-auth .btn-nav-login {
        display: none !important;
    }
}

.home-mobile-nav {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9998;
}

.home-mobile-nav.open {
    display: block;
}

.home-mobile-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.home-mobile-drawer {
    position: absolute;
    top: 0;
    right: 0;
    width: min(320px, 88vw);
    height: 100%;
    background: var(--bg-dark, #030a16);
    border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    padding: 0;
    box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.home-mobile-drawer.open {
    transform: translateX(0);
}

.home-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
}

.home-drawer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main, #fff);
    letter-spacing: 1px;
}

.home-drawer-logo span {
    color: var(--accent, #38bdf8);
    font-style: italic;
}

.home-drawer-close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-main, #fff);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.home-drawer-links {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.home-drawer-links a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-main, rgba(255, 255, 255, 0.75));
    text-decoration: none;
    transition: all 0.3s;
    letter-spacing: 0.05em;
}

.home-drawer-links a i {
    width: 18px;
    text-align: center;
    color: var(--accent, #38bdf8);
}

.home-drawer-links a:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--accent, #38bdf8);
}

.home-drawer-footer {
    padding: 20px 16px;
    border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.07));
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.home-drawer-footer a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.3s;
}

.home-drawer-footer .btn-ghost-mobile {
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
    color: var(--text-main);
}

.home-drawer-footer .btn-solid-mobile {
    background: var(--accent, #38bdf8);
    color: #fff;
}
`;

fs.appendFileSync(cssPath, appendCSS);
console.log('Appended global drawer and hamburger CSS to conneto.css');
