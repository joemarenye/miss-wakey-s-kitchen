// ============================================================
// MISS WAKEY KITCHEN — about.js
// Page-specific behavior for about.html only. Load this AFTER
// js/main.js:
//   <script src="js/main.js"></script>
//   <script src="js/about.js"></script>
// Every function here guards for its markup, so it's harmless if
// this file ever gets included on a page that doesn't have these
// sections — but it's meant for about.html specifically.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  injectAboutStyles();
  initAboutHeroReveal();
  initAboutHeroParallax();
  initStoryReveal();
  initServeCardsReveal();
  initStatementReveal();
});

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Small stylesheet for the load-in keyframes, injected once. */
function injectAboutStyles() {
  if (document.getElementById('about-page-styles')) return;

  const style = document.createElement('style');
  style.id = 'about-page-styles';
  style.textContent = `
    .about-hero__reveal {
      opacity: 0;
      transform: translateY(20px);
    }
    .about-hero__reveal.is-in {
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .about-story__text p {
      opacity: 0;
      transform: translateY(22px);
      transition:
        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .about-story__text p.is-in {
      opacity: 1;
      transform: translateY(0);
    }

    .serve-card {
      opacity: 0;
      transform: translateY(28px);
      transition:
        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .serve-card.is-in {
      opacity: 1;
      transform: translateY(0);
    }

    .about-statement {
      opacity: 0;
      transform: scale(0.97);
      transition:
        opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .about-statement.is-in {
      opacity: 1;
      transform: scale(1);
    }

    @media (prefers-reduced-motion: reduce) {
      .about-hero__reveal,
      .about-story__text p,
      .serve-card,
      .about-statement {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   ABOUT HERO — staggered entrance on load
   ============================================================ */

function initAboutHeroReveal() {
  const hero = document.querySelector('.about-hero__content');
  if (!hero) return;

  const parts = [
    hero.querySelector('.eyebrow'),
    hero.querySelector('h1'),
    hero.querySelector('.about-hero__intro'),
  ].filter(Boolean);

  if (!parts.length) return;

  parts.forEach((el) => el.classList.add('about-hero__reveal'));

  // rAF so the initial (hidden) state paints before we add is-in,
  // otherwise the transition can get skipped.
  requestAnimationFrame(() => {
    parts.forEach((el, i) => {
      window.setTimeout(() => el.classList.add('is-in'), i * 140);
    });
  });
}


/* ============================================================
   ABOUT HERO — subtle parallax on the background image
   ============================================================ */

function initAboutHeroParallax() {
  if (prefersReducedMotion()) return;

  const hero = document.querySelector('.about-hero');
  const img = document.querySelector('.about-hero__image img');
  if (!hero || !img) return;

  const MAX_SHIFT = 60; // px of vertical travel across the hero's height
  let ticking = false;

  function update() {
    const rect = hero.getBoundingClientRect();
    const heroHeight = rect.height || 1;

    // 0 when the hero's top is at the top of the viewport, 1 once
    // it has scrolled fully past.
    const progress = Math.max(0, Math.min(1, -rect.top / heroHeight));

    img.style.transform = `translate3d(0, ${(progress * MAX_SHIFT).toFixed(1)}px, 0) scale(1.08)`;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  img.style.willChange = 'transform';
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}


/* ============================================================
   ABOUT STORY — paragraphs fade up as they enter view
   (Heading stays put — it's position: sticky already.)
   ============================================================ */

function initStoryReveal() {
  const paragraphs = document.querySelectorAll('.about-story__text p');
  if (!paragraphs.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

  paragraphs.forEach((p) => io.observe(p));
}


/* ============================================================
   WHAT WE SERVE — cards rise in, staggered left to right
   ============================================================ */

function initServeCardsReveal() {
  const grid = document.querySelector('.serve-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.serve-card'));
  if (!cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const index = cards.indexOf(card);
      window.setTimeout(() => card.classList.add('is-in'), index * 110);
      io.unobserve(card);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  cards.forEach((card) => io.observe(card));
}


/* ============================================================
   BRAND STATEMENT — settles into place, like a stamp
   ============================================================ */

function initStatementReveal() {
  const statement = document.querySelector('.about-statement');
  if (!statement) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        statement.classList.add('is-in');
        io.unobserve(statement);
      }
    });
  }, { threshold: 0.3 });

  io.observe(statement);
}