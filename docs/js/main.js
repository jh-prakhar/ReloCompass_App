/* ==========================================================================
   ReloCompass — Main JavaScript
   Handles: navbar scroll, scroll progress, smooth scrolling, FAQ accordion,
   mobile menu toggle, scroll-reveal animations.
   ========================================================================== */

(function () {
  'use strict';

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = function () {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ── Scroll progress bar ──
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ── Mobile menu toggle ──
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('.icon-open');
      const closeIcon = mobileToggle.querySelector('.icon-close');
      if (icon && closeIcon) {
        const isOpen = mobileMenu.classList.contains('open');
        icon.style.display = isOpen ? 'none' : 'block';
        closeIcon.style.display = isOpen ? 'block' : 'none';
      }
    });
    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        const icon = mobileToggle.querySelector('.icon-open');
        const closeIcon = mobileToggle.querySelector('.icon-close');
        if (icon && closeIcon) {
          icon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      });
    });
  }

  // ── FAQ Accordion ──
  document.querySelectorAll('.faq-item').forEach(function (item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');
        // Close all other items
        document.querySelectorAll('.faq-item').forEach(function (other) {
          other.classList.remove('open');
        });
        // Toggle current
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // ── Scroll-reveal animations (Intersection Observer) ──
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── Footer year ──
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
