const fs = require('fs');

let content = fs.readFileSync('views/index.ejs', 'utf-8');

// 1. Add Odometer CSS/JS to head/body
content = content.replace(
    '<link rel="stylesheet" href="/css/conneto.css" />',
    '<link rel="stylesheet" href="/css/conneto.css" />\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-minimal.min.css" />'
);

content = content.replace(
    '<script src="https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.min.js"></script>',
    '<script src="https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/odometer.min.js"></script>'
);

// 2. Add Odometer init script
const odoInit = `
        // Odometer Logic
        gsap.utils.toArray('.odometer').forEach(el => {
            let odo = new Odometer({ el: el, value: 0, format: '(,ddd)', theme: 'minimal' });
            let val = el.getAttribute('data-val');
            ScrollTrigger.create({
                trigger: el,
                start: "top 90%",
                onEnter: () => odo.update(val),
                once: true
            });
        });
`;
content = content.replace(
    '// Fade Ups',
    `${odoInit}\n        // Fade Ups`
);

// 3. Fix Stats HTML to use Odometers
content = content.replace(
    '<div class="stat-num">500+</div>',
    '<div class="stat-num"><span class="odometer" data-val="500">0</span>+</div>'
);
content = content.replace(
    '<div class="stat-num">10k</div>',
    '<div class="stat-num"><span class="odometer" data-val="10000">0</span>+</div>'
);
content = content.replace(
    '<div class="stat-num">2.4k</div>',
    '<div class="stat-num"><span class="odometer" data-val="2400">0</span>+</div>'
);
content = content.replace(
    '<div class="stat-num">95%</div>',
    '<div class="stat-num"><span class="odometer" data-val="95">0</span>%</div>'
);

// 4. Add Company Logos section (Missing previously)
const logosSection = `
    <!-- Top Partners -->
    <section class="sec-padding" style="background: var(--bg-dark);">
        <div class="container text-center">
            <h6 style="color:var(--text-muted); letter-spacing:0.2em; text-transform:uppercase; margin-bottom: 3rem; font-size:0.85rem;" class="gsap-up">Trusted by Industry Leaders</h6>
            <div class="comp-grid gsap-up">
                <div class="comp-logo">GOOGLE</div>
                <div class="comp-logo">MICROSOFT</div>
                <div class="comp-logo">AMAZON</div>
                <div class="comp-logo">META</div>
                <div class="comp-logo">NETFLIX</div>
                <div class="comp-logo">SPOTIFY</div>
                <div class="comp-logo">TESLA</div>
                <div class="comp-logo">APPLE</div>
            </div>
        </div>
    </section>
`;

content = content.replace(
    '<!-- Marquee 2 -->',
    `${logosSection}\n    <!-- Marquee 2 -->`
);

// 5. Enhance CSS for comp-grid handling 8 logos
content = content.replace(
    '.comp-grid { grid-template-columns: repeat(2, 1fr); }',
    '.comp-grid { grid-template-columns: repeat(2, 1fr); row-gap: 2rem; }' // Mobile adjustment
);

// 6. Add "Our Process" Section for more content
const processSection = `
    <!-- Our Process -->
    <section class="sec-padding" style="background: var(--bg-dark); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="container">
            <h2 class="sec-title gsap-up text-center">The <span>Process</span></h2>
            <div class="row gy-5 mt-5">
                <div class="col-md-6 gsap-up">
                    <div style="padding-right: 2rem;">
                        <h4 style="font-size: 2rem; color: #fff; margin-bottom: 1rem;"><span style="color:var(--accent); font-style:italic;">01.</span> Profile Creation</h4>
                        <p style="color:var(--text-muted); line-height:1.8; font-weight:300;">We construct a digital representation of your professional capabilities. Your profile serves as the cornerstone of our algorithmic matching.</p>
                    </div>
                </div>
                <div class="col-md-6 gsap-up" style="transition-delay: 0.1s;">
                    <div style="padding-left: 2rem;">
                        <h4 style="font-size: 2rem; color: #fff; margin-bottom: 1rem;"><span style="color:var(--accent); font-style:italic;">02.</span> Algorithmic Match</h4>
                        <p style="color:var(--text-muted); line-height:1.8; font-weight:300;">Our systems analyze your skills against thousands of elite opportunities, bypassing the noise and presenting only highly relevant roles.</p>
                    </div>
                </div>
                <div class="col-md-6 gsap-up" style="transition-delay: 0.2s; margin-top:4rem;">
                    <div style="padding-right: 2rem;">
                        <h4 style="font-size: 2rem; color: #fff; margin-bottom: 1rem;"><span style="color:var(--accent); font-style:italic;">03.</span> Direct Connection</h4>
                        <p style="color:var(--text-muted); line-height:1.8; font-weight:300;">Bypass traditional HR filters. We connect you directly with decision-makers at tier-one organizations for expedited hiring.</p>
                    </div>
                </div>
                <div class="col-md-6 gsap-up" style="transition-delay: 0.3s; margin-top:4rem;">
                    <div style="padding-left: 2rem;">
                        <h4 style="font-size: 2rem; color: #fff; margin-bottom: 1rem;"><span style="color:var(--accent); font-style:italic;">04.</span> Career Elevation</h4>
                        <p style="color:var(--text-muted); line-height:1.8; font-weight:300;">Secure your role, gain unparalleled industry experience, and elevate your career trajectory to the next echelon.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

content = content.replace(
    '<!-- Full Screen Reveal -->',
    `${processSection}\n    <!-- Full Screen Reveal -->`
);

fs.writeFileSync('views/index.ejs', content);
