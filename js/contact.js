// ============================================================
// MISS WAKEY KITCHEN — contact.js
// Page-specific behavior for contact.html only. Load this AFTER
// js/main.js (which already handles the header and mobile nav):
//   <script src="js/main.js"></script>
//   <script src="js/contact.js"></script>
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initIntroReveal();
  initContactDetailsReveal();
  initFindUsReveal();
  initMapLoading();
});

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
   CONTAINER 1 — intro copy fades/rises in on load
   ============================================================ */

function initIntroReveal() {
  const copy = document.querySelector('.contact-intro__copy');
  if (!copy) return;

  const parts = [
    copy.querySelector('.eyebrow'),
    copy.querySelector('h1'),
    copy.querySelector('.contact-intro__lead'),
  ].filter(Boolean);

  if (!parts.length || prefersReducedMotion()) return;

  parts.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition =
      'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  requestAnimationFrame(() => {
    parts.forEach((el, i) => {
      window.setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 130);
    });
  });
}


/* ============================================================
   CONTAINER 1 — contact detail cards, staggered on scroll-in
   ============================================================ */

function initContactDetailsReveal() {
  const cards = document.querySelectorAll('.contact-details .contact-detail');
  if (!cards.length) return;

  if (prefersReducedMotion()) return;

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition =
      'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const index = Array.from(cards).indexOf(card);
      window.setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 90);
      io.unobserve(card);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  cards.forEach((card) => io.observe(card));
}


/* ============================================================
   CONTAINER 2 — "find us" content fades in as it scrolls up
   ============================================================ */

function initFindUsReveal() {
  const targets = [
    document.querySelector('.find-us__content .eyebrow'),
    document.querySelector('.find-us__content h2'),
    document.querySelector('.find-us__lead'),
    document.querySelector('.location-detail'),
    document.querySelector('.map-link'),
  ].filter(Boolean);

  if (!targets.length || prefersReducedMotion()) return;

  targets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition =
      'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      targets.forEach((el, i) => {
        window.setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, i * 90);
      });
      io.disconnect();
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

  io.observe(document.querySelector('.find-us__content'));
}


/* ============================================================
   MAP — swap the loading skeleton for the map once it's ready
   ============================================================ */

function initMapLoading() {
  const card = document.querySelector('[data-map-card]');
  const frame = document.querySelector('[data-map-frame]');
  if (!card || !frame) return;

  frame.addEventListener('load', () => {
    card.classList.add('is-loaded');
  });

  // Some browsers fire 'load' before the listener attaches on a
  // cached/instant response — cover that case too.
  if (frame.complete) {
    card.classList.add('is-loaded');
  }
}