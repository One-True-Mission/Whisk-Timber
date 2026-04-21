/* ===========================================
   WHISK & TIMBER — Interactions
   =========================================== */

(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const setHeaderState = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Carousel ---------- */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const slides = Array.from(track.children);
    let index = 0;
    let autoTimer = null;

    const getPerView = () => {
      if (window.innerWidth <= 720) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const getMaxIndex = () => Math.max(0, slides.length - getPerView());

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      const pages = getMaxIndex() + 1;
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === index) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    };

    const updateDots = () => {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };

    const applyTransform = () => {
      const slideEl = slides[0];
      if (!slideEl) return;
      const slideWidth = slideEl.getBoundingClientRect().width;
      const gap = parseInt(window.getComputedStyle(track).gap) || 28;
      const offset = (slideWidth + gap) * index;
      track.style.transform = `translateX(-${offset}px)`;
    };

    const goTo = (i) => {
      const max = getMaxIndex();
      if (i < 0) i = max;
      if (i > max) i = 0;
      index = i;
      applyTransform();
      updateDots();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(next, 5500);
    };
    const stopAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    };

    nextBtn.addEventListener('click', () => { next(); startAuto(); });
    prevBtn.addEventListener('click', () => { prev(); startAuto(); });

    const carouselEl = document.getElementById('carousel');
    carouselEl.addEventListener('mouseenter', stopAuto);
    carouselEl.addEventListener('mouseleave', startAuto);

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      startAuto();
    }, { passive: true });

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const max = getMaxIndex();
        if (index > max) index = max;
        buildDots();
        applyTransform();
      }, 150);
    });

    buildDots();
    applyTransform();
    startAuto();
  }

  /* ---------- Contact form (Formspree) ---------- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (form && note) {
    form.addEventListener('submit', async (e) => {
      // Only handle with fetch if Formspree is wired up
      const action = form.getAttribute('action') || '';
      if (action.includes('YOUR_FORMSPREE_ID')) {
        e.preventDefault();
        note.textContent =
          'Form is not yet connected. Please call (903) 787-0726 to plan your event.';
        note.className = 'form-note error';
        return;
      }

      e.preventDefault();
      note.textContent = 'Sending...';
      note.className = 'form-note';

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          form.reset();
          note.textContent =
            "Thank you! We'll be in touch within 1–2 business days.";
          note.className = 'form-note success';
        } else {
          note.textContent =
            'Something went wrong. Please call (903) 787-0726 to reach us directly.';
          note.className = 'form-note error';
        }
      } catch (err) {
        note.textContent =
          'Network issue. Please call (903) 787-0726 to reach us directly.';
        note.className = 'form-note error';
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 82;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
