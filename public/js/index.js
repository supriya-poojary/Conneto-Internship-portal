// LOADER
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('out');
    }, 300);
});

// PARTICLE CANVAS
const canvas = document.getElementById('bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 90; i++) {
        pts.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            a: Math.random() * 0.35 + 0.08,
            c: Math.random() > 0.5 ? '56,189,248' : '125,211,252'
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.c},${p.a})`;
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// SCROLL REVEAL (Intersection Observer)
const els = document.querySelectorAll('.reveal, .fcard, .icard, .mcard, .ncard, .nitem');
const ob = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('vis');
        }
    });
}, { threshold: 0.1 });

els.forEach(e => ob.observe(e));

// Subtle Tilt Effect for Boxes
document.querySelectorAll('.fcard, .icard, .mcard').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-10px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)`;
    });
});

// Parallax for Background Images
window.addEventListener('scroll', () => {
    const bgs = document.querySelectorAll('.section-bg-image');
    bgs.forEach(bg => {
        let offset = window.pageYOffset;
        bg.style.backgroundPositionY = (offset * 0.1) + 'px';
    });
});

// Animation Delays for Grids
document.querySelectorAll('.fcard').forEach((c, i) => c.style.animationDelay = (i * 0.1) + 's');
document.querySelectorAll('.icard').forEach((c, i) => c.style.animationDelay = (i * 0.08) + 's');
document.querySelectorAll('.mcard').forEach((c, i) => c.style.animationDelay = (i * 0.1) + 's');
document.querySelectorAll('.ncard').forEach((c, i) => c.style.animationDelay = (i * 0.1) + 's');
document.querySelectorAll('.nitem').forEach((c, i) => c.style.animationDelay = (i * 0.12) + 's');

// BACK TO TOP + NAVBAR SCROLL EFFECTS
const btt = document.getElementById('btt');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
    if (btt) {
        btt.classList.toggle('show', window.scrollY > 400);
    }
    if (nav) {
        nav.style.boxShadow = window.scrollY > 60 ? '0 4px 26px rgba(22,68,200,.12)' : '0 2px 20px rgba(22,68,200,.06)';
    }
});

// INTERACTIVE COMPONENTS (Tabs, Categories, Feature Selection)
function setTab(el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
}

function setScat(el) {
    document.querySelectorAll('.scat').forEach(s => s.classList.remove('on'));
    el.classList.add('on');
}

// Expose functions to global scope for HTML onclick access
window.setTab = setTab;
window.setScat = setScat;

// Feature card selection state
document.querySelectorAll('.fcard').forEach(c => {
    c.addEventListener('click', function () {
        document.querySelectorAll('.fcard').forEach(x => x.classList.remove('on'));
        this.classList.add('on');
    });
});

document.querySelectorAll('.bfeat').forEach(c => {
    c.addEventListener('click', function () {
        document.querySelectorAll('.bfeat').forEach(x => x.classList.remove('on'));
        this.classList.add('on');
    });
});

// COUNTER NUMBERS ANIMATION
function animCounter(id, target, dur) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = target / (dur / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current);
    }, 16);
}

const numObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animCounter('c1', 50, 1800);
            animCounter('c2', 8, 1500);
            animCounter('c3', 120, 2000);
            animCounter('c4', 99, 1600);
            numObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

const nsec = document.querySelector('.nums-sec');
if (nsec) numObserver.observe(nsec);

// ============================================================
// ALL-SECTION ROAMING PARTICLE CANVAS ANIMATION
// (makes the boring white sections alive with background particles)
// ============================================================
(function initSectionParticles() {
    // We target every section so nothing looks boring or plain white
    const targets = [
        { sel: '.about-sec', colors: ['56,189,248', '125,211,252', '22,68,200'] },
        { sel: '.features-sec', colors: ['56,189,248', '186,230,253', '14,165,233'] },
        { sel: '.intern-sec', colors: ['56,189,248', '125,211,252', '251,191,36'] },
        { sel: '.mentors-sec', colors: ['56,189,248', '186,230,253', '22,68,200'] },
        { sel: '.blue-sec', colors: ['56,189,248', '125,211,252', '251,191,36'] },
        { sel: '.testi-sec', colors: ['56,189,248', '255,255,255', '255,255,255'] }, // Updated to white/blue for dark BG
        { sel: '.news-sec', colors: ['56,189,248', '125,211,252', '14,165,233'] },
    ];

    targets.forEach(({ sel, colors }) => {
        const section = document.querySelector(sel);
        if (!section) return;

        // Position relative needed for absolute canvas
        section.style.position = 'relative';

        // Set up the canvas
        const cv = document.createElement('canvas');
        cv.style.position = 'absolute';
        cv.style.inset = '0';
        cv.style.width = '100%';
        cv.style.height = '100%';
        cv.style.pointerEvents = 'none';
        cv.style.zIndex = '0';
        section.prepend(cv);

        const ctx = cv.getContext('2d');
        let W, H, particles = [], orbs = [], t = 0, running = false;

        function resize() {
            W = cv.width = section.offsetWidth;
            H = cv.height = section.offsetHeight;
        }

        // Initialize particles
        const NUM = 50;
        for (let i = 0; i < NUM; i++) {
            const c = colors[Math.floor(Math.random() * colors.length)];
            particles.push({
                x: Math.random() * (W || 1200),
                y: Math.random() * (H || 800),
                r: Math.random() * 2.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                alpha: Math.random() * 0.35 + 0.05,
                color: c
            });
        }

        // Initialize glowing background orbs
        const orbDefs = [
            { xR: 0.15, yR: 0.3, r: 0.28, c: [56, 189, 248], ph: 0 },
            { xR: 0.80, yR: 0.2, r: 0.22, c: [14, 165, 233], ph: 1.4 },
            { xR: 0.50, yR: 0.75, r: 0.30, c: [125, 211, 252], ph: 2.2 },
        ];
        orbDefs.forEach(o => orbs.push({ ...o }));

        function draw() {
            W = cv.width = section.offsetWidth;
            H = cv.height = section.offsetHeight;
            ctx.clearRect(0, 0, W, H);

            // 1. Draw drifting gradient orbs
            orbs.forEach(orb => {
                const ox = (orb.xR + Math.sin(t * 0.22 + orb.ph) * 0.06) * W;
                const oy = (orb.yR + Math.cos(t * 0.18 + orb.ph) * 0.06) * H;
                const gr = Math.min(W, H) * orb.r;
                const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, gr);
                g.addColorStop(0, `rgba(${orb.c},0.15)`);
                g.addColorStop(0.5, `rgba(${orb.c},0.05)`);
                g.addColorStop(1, `rgba(${orb.c},0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(ox, oy, gr, 0, Math.PI * 2);
                ctx.fill();
            });

            // 2. Draw floating particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
                ctx.fill();
            });

            // 3. Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        // Alpha fades out as distance approaches 120
                        ctx.strokeStyle = `rgba(56,189,248,${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            t += 0.01;
            if (running) requestAnimationFrame(draw);
        }

        // Intersection observer: only animate when we can see it
        const secObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !running) {
                    running = true;
                    resize();
                    draw();
                } else if (!e.isIntersecting) {
                    running = false;
                }
            });
        }, { rootMargin: '100px' });

        secObs.observe(section);
        window.addEventListener('resize', resize);
    });
})();

// ============================================================
// ENHANCED CARDS: Mouse Parallax + Interactive Glow Tracking
// ============================================================
// Makes the cards shine and move based on where the mouse is
document.querySelectorAll('.fcard, .mcard, .ncard').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        // Calculate mouse position -1 to 1
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        const glowX = 50 + x * 30; // 20% to 80%
        const glowY = 50 + y * 30;

        card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(56,189,248,0.15), transparent 70%), #ffffff`;
        card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-12px) scale(1.03)`;
        card.style.boxShadow = `0 20px 50px rgba(56,189,248,0.18), 0 0 0 2px rgba(56,189,248,0.3)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.background = '';
        card.style.transform = '';
        card.style.boxShadow = '';
    });
});

// ============================================================
// PREMIUM HEADING ANIMATION (Character by Character)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Heading Animations
    const textAnimElements = document.querySelectorAll(".text-anim");

    if (textAnimElements.length > 0) {
        textAnimElements.forEach((el) => {
            // Check if SplitText is available (Premium GSAP)
            if (typeof SplitText !== "undefined") {
                const split = new SplitText(el, { type: "chars, words" });
                gsap.from(split.chars, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                    duration: 0.8,
                    stagger: 0.02,
                    y: 20,
                    opacity: 0,
                    ease: "power2.out"
                });
            } else {
                // FALLBACK: Simple reveal if SplitText is missing
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%"
                    },
                    duration: 1,
                    y: 30,
                    opacity: 0,
                    ease: "power2.out"
                });
            }
        });
    }

    // 2. Prepare Button Text for Hover Effect (Data Attribute)
    // This allows the CSS ::after content to match the span text
    document.querySelectorAll(".tj-primary-btn .btn_text span").forEach(span => {
        if (!span.getAttribute("data-text")) {
            span.setAttribute("data-text", span.textContent.trim());
        }
    });
});

