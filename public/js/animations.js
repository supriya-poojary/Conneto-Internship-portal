// SHARED ANIMATIONS

// SCROLL EFFECTS
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Parallax Background Layers
  const bgLayers = document.querySelectorAll('.bg-l');
  bgLayers.forEach((layer, i) => {
    const speed = (i + 1) * 0.02;
    layer.style.transform = `translateY(${window.scrollY * speed}px)`;
  });
});

// REVEAL ON SCROLL
const reveals = document.querySelectorAll('.rev, .revL, .revR, .stgg');
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
    }
  });
}, observerOptions);

reveals.forEach(r => revealObserver.observe(r));
