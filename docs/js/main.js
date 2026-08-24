/* ==========================================================================
   ReloCompass — Main JavaScript
   Handles: navbar scroll, scroll progress, smooth scrolling, FAQ accordion,
   mobile menu toggle, scroll-reveal animations.
   ========================================================================== */

(function () {
  'use strict';

  // ── PWA: service worker registration ──
  if (
    'serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost')
  ) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register(
          location.pathname.indexOf('/ReloCompass_App/') === 0
            ? '/ReloCompass_App/sw.js'
            : 'sw.js'
        )
        .then(function (reg) {
          // Safari has no Background Sync — ask the SW to replay queued
          // applies whenever the page loads while online.
          if (navigator.onLine && reg.active) {
            reg.active.postMessage('relocompass:replay-applies');
          }
        })
        .catch(function () { /* SW is progressive enhancement — never break the page */ });
    });

    // Reconnect while the page is open → replay queued offline actions
    window.addEventListener('online', function () {
      navigator.serviceWorker.ready.then(function (reg) {
        reg.active && reg.active.postMessage('relocompass:replay-applies');
      });
    });
  }

  // ── PWA: install prompt ──
  let deferredInstallPrompt = null;
  var INSTALL_DISMISSED_KEY = 'relocompass_install_dismissed';

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (sessionStorage.getItem(INSTALL_DISMISSED_KEY)) return;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  function showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.style.cssText =
      'position:fixed;bottom:1rem;left:1rem;right:1rem;z-index:9999;display:flex;align-items:center;gap:0.75rem;' +
      'background:#0F172A;color:#F6EFE2;padding:0.85rem 1rem;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.35);' +
      'font-size:0.85rem;max-width:34rem;margin:0 auto;';
    banner.innerHTML =
      '<span style="font-size:1.3rem">🧭</span>' +
      '<span style="flex:1"><strong>Install ReloCompass</strong> — quick access from your home screen.</span>' +
      '<button id="pwa-install-btn" style="background:linear-gradient(135deg,#3B82F6,#06B6D4);color:#fff;border:none;' +
      'border-radius:8px;padding:0.5rem 0.9rem;font-weight:600;font-size:0.8rem;cursor:pointer">Install</button>' +
      '<button id="pwa-install-close" aria-label="Dismiss" style="background:none;border:none;color:#94A3B8;' +
      'font-size:1rem;cursor:pointer;padding:0.25rem">✕</button>';

    document.body.appendChild(banner);

    banner.querySelector('#pwa-install-btn').addEventListener('click', function () {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(function (choice) {
        if (choice && choice.outcome) deferredInstallPrompt = null;
        hideInstallBanner();
      });
    });
    banner.querySelector('#pwa-install-close').addEventListener('click', function () {
      sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
      hideInstallBanner();
    });
  }

  function hideInstallBanner() {
    var el = document.getElementById('pwa-install-banner');
    if (el) el.remove();
  }

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
