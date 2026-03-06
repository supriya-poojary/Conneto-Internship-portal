const fs = require('fs');
const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Conneto - India's #1 internship portal connecting ambitious students with top companies." />
    <title><%= title %></title>
    <link rel="shortcut icon" href="/solvior/images/fav.png" />
    <link rel="stylesheet" href="/solvior/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/solvior/css/font-awesome-pro.min.css" />
    <link rel="stylesheet" href="/css/conneto.css" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        :root {
            --bg-dark: #030a16;
            --bg-darker: #01050b;
            --accent: #0075ff;
            --text-main: #f4f4f5;
            --text-muted: #888;
        }
        body { background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; font-weight: 400; }
        
        /* Lenis */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }

        /* Loader */
        .loader { position: fixed; inset: 0; background: var(--bg-darker); z-index: 9999; display: flex; align-items: center; justify-content: center; color: var(--accent); font-family: 'Playfair Display', serif; font-size: 2rem; letter-spacing: 0.2em; text-transform: uppercase; }

        /* Header */
        .c-nav { position: fixed; top: 0; width: 100%; z-index: 1000; transition: all 0.4s ease; padding: 20px 0; mix-blend-mode: difference; }
        .c-nav.scrolled { background: rgba(3, 10, 22, 0.9); backdrop-filter: blur(10px); padding: 15px 0; mix-blend-mode: normal; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .c-nav-inner { display: flex; justify-content: space-between; align-items: center; padding: 0 40px; }
        .c-nav-logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 1px; }
        .c-nav-logo span { color: var(--accent); font-style: italic; }
        .c-nav-links { display: flex; gap: 40px; list-style: none; margin: 0; padding: 0; }
        .c-nav-links a { color: #fff; text-decoration: none; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; position: relative; }
        .c-nav-links a.active::after, .c-nav-links a:hover::after { width: 100%; }
        .c-nav-links a::after { content: ''; position: absolute; width: 0; height: 1px; bottom: -6px; left: 50%; background: var(--accent); transition: all 0.3s ease; transform: translateX(-50%); }
        .c-nav-actions { display: flex; align-items: center; gap: 15px; }

        .btn-luxury { display: inline-flex; align-items: center; gap: 10px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 500; color: #fff; padding: 12px 28px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; transition: all 0.3s; text-decoration: none; }
        .btn-luxury:hover { background: #fff; color: var(--bg-dark); }
        .btn-luxury-solid { background: var(--accent); border-color: var(--accent); }
        .btn-luxury-solid:hover { background: #005ecc; border-color: #005ecc; color: #fff; }

        /* Hero */
        .hero { height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: -10%; width: 120%; height: 120%; object-fit: cover; filter: brightness(0.4) grayscale(20%); z-index: -1; }
        .hero-content { text-align: center; z-index: 10; padding: 0 20px; }
        .hero-title { font-size: clamp(3rem, 8vw, 7rem); line-height: 1; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 2rem; color: #fff; }
        .hero-title span { font-style: italic; color: var(--accent); }
        .hero-sub { font-family: 'Inter', sans-serif; font-size: clamp(0.9rem, 2vw, 1.1rem); font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #ccc; margin-bottom: 3rem; }
        
        .scroll-indicator { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 1rem; opacity: 0.7; }
        .scroll-indicator span { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; }
        .scroll-line { width: 1px; height: 60px; background: rgba(255,255,255,0.2); position: relative; overflow: hidden; }
        .scroll-line::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff; transform: translateY(-100%); animation: scrollDown 2s infinite cubic-bezier(0.77, 0, 0.175, 1); }
        @keyframes scrollDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }

        /* Marquee */
        .marquee-container { padding: 4rem 0; background: var(--bg-darker); overflow: hidden; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; white-space: nowrap; }
        .marquee-inner { display: flex; }
        .marquee-text { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 6vw, 6rem); text-transform: uppercase; font-style: italic; padding: 0 2vw; color: rgba(255,255,255,0.8); }
        .marquee-accent { background: var(--accent); color: #fff; border: none; }
        .marquee-accent .marquee-text { color: #fff; }

        /* Section Global */
        .sec-padding { padding: 10rem 0; }
        .sec-title { font-size: clamp(2.5rem, 5vw, 5rem); line-height: 1.1; margin-bottom: 4rem; }
        .sec-title span { color: var(--accent); font-style: italic; }

        /* Stats Parallax */
        .stats-wrap { padding: 8rem 0; background: var(--bg-darker); }
        .stat-box { text-align: center; padding: 3rem 0; border-right: 1px solid rgba(255,255,255,0.05); }
        .stat-box:last-child { border: none; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 4rem; color: #fff; margin-bottom: 1rem; }
        .stat-label { font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }

        /* Features */
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4rem; margin-top: 4rem; }
        .feat-card { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; transition: transform 0.4s; }
        .feat-card:hover { transform: translateY(-10px); }
        .feat-num { font-size: 0.85rem; color: var(--accent); letter-spacing: 0.15em; margin-bottom: 1.5rem; display: block; }
        .feat-title { font-size: 1.8rem; margin-bottom: 1.5rem; color: #fff; }
        .feat-desc { color: var(--text-muted); line-height: 1.8; font-weight: 300; font-size: 1.05rem; }

        /* Companies Parallax */
        .comp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3rem; align-items: center; justify-items: center; opacity: 0.6; }
        .comp-logo { font-family: 'Playfair Display', serif; font-size: 2rem; font-style: italic; letter-spacing: 2px; color: #fff; transition: opacity 0.3s; }
        .comp-logo:hover { opacity: 1; color: var(--accent); }

        /* Reveal Section */
        .reveal-sec { height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; background: #fff; color: var(--bg-dark); }
        .reveal-bg { position: absolute; inset: 0; overflow: hidden; clip-path: inset(15% 15% 15% 15%); }
        .reveal-bg img { width: 100%; height: 100%; object-fit: cover; }
        .reveal-content { z-index: 10; text-align: center; }
        .reveal-text { font-family: 'Playfair Display', serif; font-size: clamp(4rem, 10vw, 10rem); line-height: 0.9; color: #fff; font-style: italic; }

        /* Search Section */
        .search-container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 2rem; border-radius: 4px; backdrop-filter: blur(10px); }
        .search-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 1.2rem; padding: 1rem 0; font-family: 'Playfair Display', serif; letter-spacing: 1px; margin-bottom: 2rem; }
        .search-input:focus { outline: none; border-color: var(--accent); }
        .search-input::placeholder { color: rgba(255,255,255,0.3); }

        /* Footer */
        .c-footer { padding: 8rem 0 2rem; background: var(--bg-darker); border-top: 1px solid rgba(255,255,255,0.05); }
        .f-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6rem; }
        .f-title { font-size: clamp(2.5rem, 5vw, 5rem); line-height: 1; }
        .f-links { display: flex; gap: 3rem; }
        .f-links-col h6 { font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2rem; }
        .f-links-col a { display: block; color: #ccc; text-decoration: none; margin-bottom: 1rem; font-size: 0.95rem; transition: color 0.3s; }
        .f-links-col a:hover { color: var(--accent); }
        .f-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem; }
        .f-socials { display: flex; gap: 1.5rem; }
        .f-socials a { color: #fff; opacity: 0.6; transition: all 0.3s; width: 20px; }
        .f-socials a:hover { opacity: 1; color: var(--accent); transform: translateY(-2px); }

        @media (max-width: 991px) {
            .c-nav-inner { padding: 0 20px; }
            .c-nav-links { display: none; }
            .feat-grid { grid-template-columns: 1fr; }
            .stat-box { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .comp-grid { grid-template-columns: repeat(2, 1fr); }
            .f-top { flex-direction: column; align-items: flex-start; gap: 4rem; }
            .reveal-bg { clip-path: inset(5%); }
        }
    </style>
</head>
<body>
    <!-- Loader -->
    <div class="loader">Conneto</div>

    <!-- Nav -->
    <header class="c-nav">
        <div class="c-nav-inner">
            <a href="/" class="c-nav-logo">Con<span>neto</span></a>
            <ul class="c-nav-links">
                <li><a href="/" class="active">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/internships">Internships</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
            <div class="c-nav-actions">
                <% if(user){ %>
                    <a href="/<%= user.role %>/dashboard" class="btn-luxury btn-luxury-solid">Dashboard</a>
                    <a href="/auth/logout" class="btn-luxury">Logout</a>
                <% } else { %>
                    <a href="/auth/login" class="btn-luxury">Login</a>
                    <a href="/auth/register" class="btn-luxury btn-luxury-solid">Get Started</a>
                <% } %>
            </div>
        </div>
    </header>

    <!-- Hero -->
    <section class="hero">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2400" alt="Corporate" class="hero-bg plx-bg">
        <div class="hero-content">
            <div class="hero-title gsap-reveal">Shape Your<br><span>Future.</span></div>
            <div class="hero-sub gsap-reveal-delay">India's Premier Internship Network</div>
            <div class="gsap-reveal-delay-2">
                <a href="/internships" class="btn-luxury btn-luxury-solid" style="margin-right:15px;">Explore Roles</a>
                <a href="/auth/register" class="btn-luxury">Join Network</a>
            </div>
        </div>
        <div class="scroll-indicator">
            <span>Scroll</span>
            <div class="scroll-line"></div>
        </div>
    </section>

    <!-- Marquee 1 -->
    <section class="marquee-container">
        <div class="marquee-inner" id="mq1">
            <div class="marquee-text">DISCOVER • CONNECT • ELEVATE • </div>
            <div class="marquee-text">DISCOVER • CONNECT • ELEVATE • </div>
            <div class="marquee-text">DISCOVER • CONNECT • ELEVATE • </div>
        </div>
    </section>

    <!-- Search Section -->
    <section class="sec-padding">
        <div class="container text-center">
            <h2 class="sec-title gsap-up">Find Your <span>Path</span></h2>
            <div class="search-container gsap-up">
                <form action="/internships" method="GET">
                    <input type="text" name="search" class="search-input" placeholder="Search Role or Skill...">
                    <input type="text" name="location" class="search-input" placeholder="Location...">
                    <button type="submit" class="btn-luxury btn-luxury-solid" style="width:100%; justify-content:center;">Discover Opportunities</button>
                </form>
            </div>
        </div>
    </section>

    <!-- Full Screen Reveal -->
    <section class="reveal-sec">
        <div class="reveal-bg">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2400" alt="Teamwork">
        </div>
        <div class="reveal-content">
            <div class="reveal-text">Bridging<br>Talent.</div>
        </div>
    </section>

    <!-- Features -->
    <section class="sec-padding">
        <div class="container">
            <h2 class="sec-title gsap-up">The Conneto <span>Advantage</span></h2>
            <div class="feat-grid">
                <div class="feat-card gsap-up">
                    <span class="feat-num">01 — CURATION</span>
                    <h4 class="feat-title">Smart Matching</h4>
                    <p class="feat-desc">Our intelligent systems align your unique profile with the most sought-after companies, eliminating noise and presenting clarity.</p>
                </div>
                <div class="feat-card gsap-up" style="transition-delay: 0.1s;">
                    <span class="feat-num">02 — EFFICIENCY</span>
                    <h4 class="feat-title">Seamless Apply</h4>
                    <p class="feat-desc">A refined, one-click application process. Once your portfolio is refined, opportunity is merely a click away.</p>
                </div>
                <div class="feat-card gsap-up" style="transition-delay: 0.2s;">
                    <span class="feat-num">03 — ASSURANCE</span>
                    <h4 class="feat-title">Verified Partners</h4>
                    <p class="feat-desc">Exclusive access to thoroughly vetted tier-one organizations. Apply with absolute confidence.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Marquee 2 -->
    <section class="marquee-container marquee-accent">
        <div class="marquee-inner" id="mq2">
            <div class="marquee-text">TECH • DESIGN • FINANCE • MARKETING • </div>
            <div class="marquee-text">TECH • DESIGN • FINANCE • MARKETING • </div>
            <div class="marquee-text">TECH • DESIGN • FINANCE • MARKETING • </div>
        </div>
    </section>

    <!-- Stats -->
    <section class="stats-wrap">
        <div class="container">
            <div class="row">
                <div class="col-md-3 stat-box">
                    <div class="stat-num">500+</div>
                    <div class="stat-label">Verified Partners</div>
                </div>
                <div class="stat-box col-md-3">
                    <div class="stat-num">10k</div>
                    <div class="stat-label">Students Placed</div>
                </div>
                <div class="stat-box col-md-3">
                    <div class="stat-num">2.4k</div>
                    <div class="stat-label">Active Listings</div>
                </div>
                <div class="stat-box col-md-3">
                    <div class="stat-num">95%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="c-footer">
        <div class="container">
            <div class="f-top">
                <h2 class="f-title">Ready to<br><span>Elevate?</span></h2>
                <div class="f-links">
                    <div class="f-links-col">
                        <h6>Navigation</h6>
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/internships">Internships</a>
                    </div>
                    <div class="f-links-col">
                        <h6>Network</h6>
                        <a href="/auth/register">Join as Student</a>
                        <a href="/auth/register">Join as Company</a>
                        <a href="/auth/login">Client Portal</a>
                    </div>
                </div>
            </div>
            <div class="f-bottom">
                <div style="color:var(--text-muted); font-size: 0.85rem; letter-spacing:1px;">© <%= new Date().getFullYear() %> Conneto. All Rights Reserved.</div>
                <div class="f-socials">
                    <a href="https://linkedin.com" target="_blank">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                    </a>
                    <a href="https://whatsapp.com" target="_blank">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>

    <!-- GSAP & Lenis -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://unpkg.com/@studio-freight/lenis@1.0.35/dist/lenis.min.js"></script>

    <script>
        // Init Lenis
        const lenis = new Lenis({ duration: 1.2, smooth: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        gsap.registerPlugin(ScrollTrigger);

        // Header Scroll
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.c-nav');
            if(window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        });

        // Load Animation
        window.addEventListener('load', () => {
            gsap.to('.loader', { yPercent: -100, duration: 1.2, ease: "power4.inOut" });
            gsap.from('.gsap-reveal', { y: 100, opacity: 0, duration: 1.5, ease: "power4.out", delay: 0.8 });
            gsap.from('.gsap-reveal-delay', { y: 50, opacity: 0, duration: 1.5, ease: "power4.out", delay: 1 });
            gsap.from('.gsap-reveal-delay-2', { y: 50, opacity: 0, duration: 1.5, ease: "power4.out", delay: 1.2 });
        });

        // Parallax
        gsap.to(".plx-bg", {
            yPercent: 30, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });

        // Marquees
        gsap.to("#mq1", { xPercent: -50, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }});
        gsap.set("#mq2", { xPercent: -50 });
        gsap.to("#mq2", { xPercent: 0, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }});

        // Reveal effect
        gsap.to(".reveal-bg", {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "power2.inOut",
            scrollTrigger: { trigger: ".reveal-sec", start: "top 80%", end: "center center", scrub: 1 }
        });
        gsap.from(".reveal-text", {
            y: 150, opacity: 0,
            scrollTrigger: { trigger: ".reveal-sec", start: "top 50%", end: "center center", scrub: 1 }
        });

        // Fade Ups
        gsap.utils.toArray('.gsap-up').forEach(el => {
            gsap.from(el, {
                y: 100, opacity: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%" }
            });
        });
    </script>
</body>
</html>`;
fs.writeFileSync('views/index.ejs', content);
