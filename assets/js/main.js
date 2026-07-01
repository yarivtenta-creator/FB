(function () {
  'use strict';

  /* ============================================
     DOM READY
     ============================================ */

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initFAQ();
    initSmoothScroll();
    initNavbarScroll();
    initGalleryLightbox();
    initScrollReveal();
    initBackToTop();
    initHeroAnimation();
  });

  /* ============================================
     MOBILE MENU
     ============================================ */

  function initMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileLinks = document.querySelectorAll('.mobile-menu a');

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      hamburger.classList.add('active');
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', function () {
      if (mobileMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  /* ============================================
     FAQ ACCORDION
     ============================================ */

  function initFAQ() {
    var faqItems = document.querySelectorAll('.faq-item');

    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            var otherQuestion = other.querySelector('.faq-question');
            if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      question.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================
     SMOOTH SCROLL
     ============================================ */

  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    var navbar = document.querySelector('.navbar');

    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        var navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      });
    });
  }

  /* ============================================
     NAVBAR SHRINK ON SCROLL
     ============================================ */

  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var scrollThreshold = 60;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================
     GALLERY LIGHTBOX
     ============================================ */

  function initGalleryLightbox() {
    var galleryItems = document.querySelectorAll('.gallery-item');
    var lightbox = document.querySelector('.lightbox');

    if (!galleryItems.length || !lightbox) return;

    var lightboxImg = lightbox.querySelector('.lightbox-img');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');

    var images = [];
    var currentIndex = 0;

    galleryItems.forEach(function (item, index) {
      var img = item.querySelector('img');
      if (img) {
        images.push({
          src: img.getAttribute('data-full') || img.src,
          alt: img.alt || ''
        });

        item.addEventListener('click', function () {
          currentIndex = index;
          showLightbox(currentIndex);
        });
      }
    });

    function showLightbox(index) {
      if (!lightboxImg || !images[index]) return;
      lightboxImg.src = images[index].src;
      lightboxImg.alt = images[index].alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lightboxImg) {
        setTimeout(function () { lightboxImg.src = ''; }, 300);
      }
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showLightbox(currentIndex);
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      showLightbox(currentIndex);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showPrev();
      if (e.key === 'ArrowLeft') showNext();
    });

    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showNext();
        else showPrev();
      }
    }, { passive: true });
  }

  /* ============================================
     SCROLL REVEAL
     ============================================ */

  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      elements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  /* ============================================
     BACK TO TOP
     ============================================ */

  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     HERO BG ANIMATION
     ============================================ */

  function initHeroAnimation() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    requestAnimationFrame(function () {
      hero.classList.add('loaded');
    });
  }

})();
