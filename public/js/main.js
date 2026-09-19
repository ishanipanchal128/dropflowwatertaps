// ===== Mobile nav toggle =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav.main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // ===== Active nav link =====
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });

  // ===== Header shadow on scroll =====
  const header = document.querySelector('header.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 4px 16px rgba(0,0,0,.12)' : '0 2px 10px rgba(0,0,0,.05)';
    });
  }

  // ===== Scroll reveal animation =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // ===== Hero slider (image + heading + paragraph swap, no animation) =====
  const HERO_SLIDES = [
    {
      image: 'images/hero/copy 1.png',
      alt: 'Premium PTMT water tap',
      headingHTML: 'Premium <strong>PTMT</strong><br><span class="accent">Water Taps</span>',
      paragraph: 'Upgrade your bathroom and kitchen with high-quality PTMT water taps designed for durability, style, and smooth performance. Rust-proof, lightweight, and long-lasting \u2013 perfect for modern homes.'
    },
    {
      image: 'images/hero/09 copy 8.png',
      alt: 'Premium PPRC water tap',
      headingHTML: 'Premium <strong>PPRC</strong><br><span class="accent">Water Taps</span>',
      paragraph: 'Upgrade your plumbing with high-quality PPRC taps designed for strength, durability, and smooth water flow. Perfect for both hot and cold water systems, ensuring long-lasting performance and reliability.'
    },
    {
      image: 'images/hero/01 copy 1.png',
      alt: 'Premium bath accessories',
      headingHTML: 'Premium <strong>BATH</strong><br>ACCESSORIES',
      paragraph: 'Enhance your bathroom with elegant and functional bath accessories designed for style, convenience, and durability. Perfectly crafted to add a modern touch to your space.'
    }
  ];

  const heroSlider = document.getElementById('hero-slider');
  if (heroSlider) {
    const slideImg = document.getElementById('hero-slide-img');
    const headingEl = document.getElementById('hero-heading');
    const paragraphEl = document.getElementById('hero-paragraph');
    const dots = heroSlider.querySelectorAll('.hero-slider-dots .dot');
    let current = 0;
    let autoplayTimer = null;

    function goToSlide(index) {
      current = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
      const slide = HERO_SLIDES[current];
      if (slideImg) { slideImg.src = slide.image; slideImg.alt = slide.alt; }
      if (headingEl) headingEl.innerHTML = slide.headingHTML;
      if (paragraphEl) paragraphEl.textContent = slide.paragraph;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function startAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goToSlide(current + 1), 4500);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        startAutoplay();
      });
    });
    startAutoplay();
  }

  // ===== Animated stat counters =====
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        el.textContent = Math.floor(progress * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterIO.observe(el));
});
