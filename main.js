(function () {
  'use strict';

  // ---- Cache DOM elements ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  const header = $('#header');
  const mobileNav = $('#mobileNav');
  const slides = $$('.carousel-slide');
  const dots = $$('.carousel-dot');
  const confettiEls = $$('.confetti');

  // ---- Header scroll shadow ----
  let lastScrolled = false;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 50;

      if (isScrolled !== lastScrolled) {
        header.classList.toggle('scrolled', isScrolled);
        lastScrolled = isScrolled;
      }

      // Parallax confetti
      confettiEls.forEach((el, i) => {
        const speed = 0.02 + i * 0.015;
        const rot = 25 + i * 15 + scrollY * 0.02;
        el.style.transform = `translateY(${scrollY * speed}px) rotate(${rot}deg)`;
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Mobile menu ----
  function openMobile() {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }

  $('#hamburger').addEventListener('click', openMobile);
  $('#closeMobile').addEventListener('click', closeMobile);
  $$('.mobile-link').forEach(link => link.addEventListener('click', closeMobile));

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeMobile();
    }
  });

  // ---- Carousel ----
  let current = 0;
  let autoplay;
  let touchStartX = 0;
  let touchEndX = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  function startAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(next, 4000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide, 10));
      startAutoplay();
    });
  });

  // Touch swipe support
  const carousel = $('#carousel');
  if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAutoplay();
      }
    }, { passive: true });
  }

  startAutoplay();

  // Pause autoplay when page is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(autoplay);
    } else {
      startAutoplay();
    }
  });

  // ---- Scroll Reveal (IntersectionObserver) ----
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  $$('.reveal, .reveal-left, .reveal-right, .stagger-children').forEach(el => {
    revealObserver.observe(el);
  });

  // ---- Newsletter form ----
  const form = $('#newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', form);
      const btn = $('button', form);

      if (!input.value) return;

      input.value = '';
      const original = btn.textContent;
      btn.textContent = '\u00A1Apuntado! \u2713';
      btn.style.backgroundColor = 'var(--green)';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = original;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 3000);
    });
  }

  // ---- Smooth scroll for anchor links ----
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
