const fs = require('fs');

let content = fs.readFileSync('views/about.ejs', 'utf-8');

// 1. Add Odometer CSS/JS to head/body
if (!content.includes('odometer-theme-minimal.min.css')) {
    content = content.replace(
        '<link rel="stylesheet" href="/solvior/css/bootstrap.min.css" />\n    <link href="https://fonts.googleapis.com/css2?',
        '<link rel="stylesheet" href="/solvior/css/bootstrap.min.css" />\n    <link rel="stylesheet" href="/css/conneto.css" />\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-minimal.min.css" />\n    <link href="https://fonts.googleapis.com/css2?'
    );
}

if (!content.includes('odometer.min.js')) {
    content = content.replace(
        '<script src="https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.min.js"></script>',
        '<script src="https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/odometer.min.js"></script>'
    );
}

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

if (!content.includes('Odometer Logic')) {
    content = content.replace(
        'gsap.utils.toArray(\'.gsap-up\').forEach',
        `${odoInit}\n        gsap.utils.toArray('.gsap-up').forEach`
    );
}

// 3. Add Stats Section to About
const statsSection = `
        <!-- Stats -->
        <section class="sec-padding" style="background: var(--bg-darker); border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div class="container">
                <div class="row style="margin-top: 2rem;"">
                    <div class="col-md-3 text-center" style="border-right: 1px solid rgba(255,255,255,0.05); padding: 3rem 0;">
                        <div style="font-family:'Playfair Display', serif; font-size:4rem; color:#fff; margin-bottom:1rem;"><span class="odometer" data-val="500">0</span>+</div>
                        <div style="font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-muted);">Verified Partners</div>
                    </div>
                    <div class="col-md-3 text-center" style="border-right: 1px solid rgba(255,255,255,0.05); padding: 3rem 0;">
                        <div style="font-family:'Playfair Display', serif; font-size:4rem; color:#fff; margin-bottom:1rem;"><span class="odometer" data-val="10000">0</span>+</div>
                        <div style="font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-muted);">Students Placed</div>
                    </div>
                    <div class="col-md-3 text-center" style="border-right: 1px solid rgba(255,255,255,0.05); padding: 3rem 0;">
                        <div style="font-family:'Playfair Display', serif; font-size:4rem; color:#fff; margin-bottom:1rem;"><span class="odometer" data-val="36">0</span></div>
                        <div style="font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-muted);">Global Markets</div>
                    </div>
                    <div class="col-md-3 text-center" style="padding: 3rem 0;">
                        <div style="font-family:'Playfair Display', serif; font-size:4rem; color:#fff; margin-bottom:1rem;"><span class="odometer" data-val="95">0</span>%</div>
                        <div style="font-size:0.85rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-muted);">Success Rate</div>
                    </div>
                </div>
            </div>
        </section>
`;

if (!content.includes('Global Markets')) {
    content = content.replace(
        '<!-- Marquee 1 -->',
        `${statsSection}\n        <!-- Marquee 1 -->`
    );
}


fs.writeFileSync('views/about.ejs', content);
