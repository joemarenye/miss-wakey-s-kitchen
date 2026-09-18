// ============================================================
// MISS WAKEY KITCHEN — shared site behavior
// Loaded on every page. Keep this file free of page-specific logic
// that doesn't degrade gracefully when the matching markup is absent.
//
// NOTE: this file now owns the hero/frame-sequence logic that used
// to live in js/frame-sequence.js (needed the zoom effect wired
// directly into the crossfade). Remove the old
// <script src="js/frame-sequence.js"> tag from your pages so the
// two scripts don't both try to build images inside the same
// [data-frame-sequence] container.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initHeaderHide();
  initMobileNav();
  initCarousels();
  initScrollReveal();
  initFrameSequences();   // hero (and any other) image sequences, with zoom
  initCookCards();        // "What's cooking this week" stack -> spread
  initDeliverySteps();    // "How delivery works" scroll-linked blur slider
  initDeliveryReveal();   // "From your desk to the site" scroll-in
});

/** Hide header on scroll-down, reveal on scroll-up. Stays put near the top. */
function initHeaderHide() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const goingDown = y > lastY;
    header.classList.toggle('header--hidden', goingDown && y > 120);
    lastY = y;
  }, { passive: true });
}

/** Mobile hamburger open/close */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '\u2715' : '\u2630';
  });
}

/** Wires up any .carousel with matching [data-carousel-prev/next] arrow buttons */
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((wrapper) => {
    const track = wrapper.querySelector('.carousel');
    const prev = wrapper.querySelector('[data-carousel-prev]');
    const next = wrapper.querySelector('[data-carousel-next]');
    if (!track) return;

    const scrollByCard = (dir) => {
      const card = track.querySelector(':scope > *');
      const amount = card ? card.getBoundingClientRect().width + 16 : 300;
      track.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    prev?.addEventListener('click', () => scrollByCard(-1));
    next?.addEventListener('click', () => scrollByCard(1));
  });
}

/** Fade-up reveal — used sparingly, only on elements explicitly marked [data-reveal] */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((el) => io.observe(el));
}


/* ============================================================
   1. FRAME SEQUENCES (hero + any other [data-frame-sequence])
   — crossfades between images and adds a slow zoom on the
   active image, anchored to the bottom-left corner.
   ============================================================ */

function initFrameSequences() {
  const containers = document.querySelectorAll('[data-frame-sequence]');
  if (!containers.length) return;

  injectFrameSequenceStyles();
  containers.forEach(setupFrameSequence);
}

function injectFrameSequenceStyles() {
  if (document.getElementById('frame-sequence-styles')) return;

  const style = document.createElement('style');
  style.id = 'frame-sequence-styles';
  style.textContent = `
    .frame-sequence img {
      transform-origin: bottom left;
      transform: scale(1);
    }
    .frame-sequence img.is-active {
      animation-name: frameSequenceZoom;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }
    @keyframes frameSequenceZoom {
      from { transform: scale(1); }
      to   { transform: scale(1.14); }
    }
    @media (prefers-reduced-motion: reduce) {
      .frame-sequence img.is-active {
        animation: none;
      }
    }
  `;
  document.head.appendChild(style);
}

function setupFrameSequence(container) {
  const src = container.dataset.src;
  const count = parseInt(container.dataset.count, 10) || 0;
  const ext = container.dataset.ext || 'jpg';
  const interval = parseInt(container.dataset.interval, 10) || 4000;

  if (!src || !count) return;

  // Support re-initialization (e.g. a page swaps data-src/data-count
  // for a time-of-day sequence and calls initFrameSequences again).
  if (container._frameSequenceTimer) {
    window.clearInterval(container._frameSequenceTimer);
    container._frameSequenceTimer = null;
  }
  container.innerHTML = '';

  const images = [];
  for (let i = 1; i <= count; i += 1) {
    const img = document.createElement('img');
    const num = String(i).padStart(2, '0');
    img.src = `${src}-${num}.${ext}`;
    img.alt = '';
    img.loading = i === 1 ? 'eager' : 'lazy';
    // Zoom should take slightly longer than the crossfade interval so it
    // never visibly "finishes early" and sits static before the next swap.
    img.style.animationDuration = `${interval + 500}ms`;
    container.appendChild(img);
    images.push(img);
  }

  if (!images.length) return;

  let current = 0;
  images[0].classList.add('is-active');

  if (images.length === 1) return;

  container._frameSequenceTimer = window.setInterval(() => {
    images[current].classList.remove('is-active');
    current = (current + 1) % images.length;
    images[current].classList.add('is-active');
  }, interval);
}


/* ============================================================
   2. "WHAT'S COOKING THIS WEEK" — stack -> horizontal spread
   Before the section is scrolled into view, the four cards sit
   directly on top of one another (card 1 on top, down to card 4
   at the bottom). On scroll-into-view they fan out horizontally,
   ending in REVERSED order — card 4, 3, 2, 1 left to right — so
   the card that started on top of the stack travels the farthest.
   ============================================================ */

function initCookCards() {
  const wrapper = document.querySelector('[data-deal-cards]');
  if (!wrapper) return;

  const cards = Array.from(wrapper.querySelectorAll('.cook-card'));
  const total = cards.length;
  if (!total) return;

  const isStacked = () => window.matchMedia('(max-width: 860px)').matches;
  let hasRevealed = false;

  function applyStackingOrder() {
    const stacked = isStacked();
    cards.forEach((card, i) => {
      if (stacked) {
        // Small screens use the site's simple 2-column grid; don't
        // reorder or layer the cards there.
        card.style.order = '';
        card.style.zIndex = '';
      } else {
        // i = 0 is "card 1" (top of the stack, ends up on the right).
        const order = total - 1 - i;
        card.style.order = String(order);
        card.style.zIndex = String(total - i); // card 1 stays highest while stacked
      }
    });
  }

  function setStacked() {
    applyStackingOrder();
    const stacked = isStacked();

    cards.forEach((card) => {
      const order = Number(card.style.order || 0);
      card.style.transition = 'none';
      card.style.transform = stacked
        ? 'translate3d(0, 24px, 0)'
        : `translate3d(calc(-100% * ${order} - var(--sp-3) * ${order}), 0, 0)`;

      // Force a reflow so the transition below isn't skipped/merged
      // with the instant reset above.
      // eslint-disable-next-line no-unused-expressions
      card.offsetWidth;

      const delay = stacked ? 0 : order * 0.08;
      card.style.transition =
        `transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
    });
  }

  function reveal() {
    cards.forEach((card) => {
      card.style.transform = 'translate3d(0, 0, 0)';
    });
    hasRevealed = true;
  }

  setStacked();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal();
      } else if (entry.boundingClientRect.top > 0 && hasRevealed) {
        // Scrolled back above the section — reset so it can replay.
        hasRevealed = false;
        setStacked();
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  io.observe(wrapper);

  window.addEventListener('resize', () => {
    if (!hasRevealed) setStacked();
    else applyStackingOrder();
  }, { passive: true });
}


/* ============================================================
   3. "HOW DELIVERY WORKS" — scroll-linked blur slider
   A single scroll-driven "slider" runs from 0% to 100% across the
   section. All 3 cards start fully blurred. Card 1 clears as the
   slider moves from 0% to ~34%, card 2 from ~33% to 67%, and
   card 3 from 67% to 100%. The slider (and the blur) tracks scroll
   position directly, so it never jumps — it's exactly as fast or
   slow as the user's scroll.
   ============================================================ */

function initDeliverySteps() {
  const section = document.querySelector('.delivery-steps-section');
  const wrap = document.querySelector('.steps-track-wrap');
  const track = document.querySelector('.steps-track');
  const steps = [...document.querySelectorAll('.steps-track .step')];

  if (!section || !wrap || !track || !steps.length) return;

  const MAX_BLUR = 14; // px — "fully blurred" state
  const segment = 1 / steps.length;
  let ticking = false;

  function computeOverallProgress() {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Slider is 0% until the section starts entering the lower part
    // of the viewport, and reaches 100% after roughly one viewport
    // height of scrolling through it.
    const start = viewportHeight * 0.85;
    const distance = viewportHeight * 1.15;

    const raw = (start - rect.top) / distance;
    return Math.max(0, Math.min(1, raw));
  }

  function rangeForStep(index) {
    const start = index === 0 ? 0 : index * segment;
    const end = Math.min(1, start + segment + (index === 0 ? 0.01 : 0));
    return [start, end];
  }

  function updateProgressLine(overall) {
    const isMobile = window.matchMedia('(max-width: 760px)').matches;

    if (isMobile) {
      const trackHeight = track.getBoundingClientRect().height;
      wrap.style.setProperty('--steps-progress', `${trackHeight * overall}px`);
    } else {
      const availableWidth = section.clientWidth * 0.84;
      wrap.style.setProperty('--steps-progress', `${availableWidth * overall}px`);
    }
  }

  function update() {
    const overall = computeOverallProgress();
    updateProgressLine(overall);

    steps.forEach((step, i) => {
      const [start, end] = rangeForStep(i);
      const t = Math.max(0, Math.min(1, (overall - start) / (end - start)));
      const blur = (1 - t) * MAX_BLUR;

      step.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      step.classList.toggle('is-active', t > 0.02);
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  update();
}


/* ============================================================
   4. CUSTOMER REVIEWS — 5 CARD ROTATING CAROUSEL
   Center card in front, two increasingly blurred cards behind it
   on either side. Each advance pushes the next card into the
   center and slides the rest over.
   ============================================================ */

(function () {
  var carousel = document.querySelector('[data-reviews]');

  if (!carousel) return;

  var cards = Array.from(
    carousel.querySelectorAll('.review-card')
  );

  var prevButton = document.querySelector('[data-review-prev]');
  var nextButton = document.querySelector('[data-review-next]');
  var dotsContainer = document.querySelector('[data-review-dots]');

  if (cards.length !== 5) return;

  var positions = [
    'far-left',
    'left',
    'center',
    'right',
    'far-right'
  ];

  var current = 0;
  var timer = null;
  var isAnimating = false;
  var autoplayDelay = 5000;

  /* ------------------------------------------------------------
     Create dots
     ------------------------------------------------------------ */

  if (dotsContainer) {

    cards.forEach(function (_, index) {

      var dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'reviews-dot';

      dot.setAttribute(
        'aria-label',
        'Show review ' + (index + 1)
      );

      dot.addEventListener('click', function () {
        goTo(index);
        restartAutoplay();
      });

      dotsContainer.appendChild(dot);
    });
  }

  var dots = dotsContainer
    ? Array.from(
        dotsContainer.querySelectorAll('.reviews-dot')
      )
    : [];

  /* ------------------------------------------------------------
     Position cards
     ------------------------------------------------------------ */

  function render(animate) {

    cards.forEach(function (card, index) {

      var offset =
        (index - current + cards.length) % cards.length;

      var position = positions[offset];

      card.setAttribute('data-position', position);

      if (!animate) {
        card.style.transition = 'none';
      } else {
        card.style.removeProperty('transition');
      }

      card.setAttribute(
        'aria-hidden',
        position === 'center' ? 'false' : 'true'
      );
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle(
        'is-active',
        index === current
      );
    });

    if (!animate) {
      requestAnimationFrame(function () {
        cards.forEach(function (card) {
          card.style.removeProperty('transition');
        });
      });
    }
  }

  /* ------------------------------------------------------------
     Move to specific review
     ------------------------------------------------------------ */

  function goTo(index) {

    if (isAnimating) return;

    index =
      (index + cards.length) %
      cards.length;

    if (index === current) return;

    isAnimating = true;

    current = index;

    render(true);

    window.setTimeout(function () {
      isAnimating = false;
    }, 780);
  }

  /* ------------------------------------------------------------
     Next / previous
     ------------------------------------------------------------ */

  function next() {
    goTo(current + 1);
  }

  function previous() {
    goTo(current - 1);
  }

  /* ------------------------------------------------------------
     Buttons
     ------------------------------------------------------------ */

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      next();
      restartAutoplay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      previous();
      restartAutoplay();
    });
  }

  /* ------------------------------------------------------------
     Autoplay
     ------------------------------------------------------------ */

  function startAutoplay() {

    stopAutoplay();

    timer = window.setInterval(function () {
      next();
    }, autoplayDelay);
  }

  function stopAutoplay() {

    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  /* ------------------------------------------------------------
     Pause while hovering
     ------------------------------------------------------------ */

  carousel.addEventListener('mouseenter', function () {
    stopAutoplay();
  });

  carousel.addEventListener('mouseleave', function () {
    startAutoplay();
  });

  /* ------------------------------------------------------------
     Touch swipe
     ------------------------------------------------------------ */

  var touchStartX = 0;
  var touchEndX = 0;

  carousel.addEventListener(
    'touchstart',
    function (event) {

      touchStartX =
        event.changedTouches[0].screenX;

      stopAutoplay();

    },
    { passive: true }
  );

  carousel.addEventListener(
    'touchend',
    function (event) {

      touchEndX =
        event.changedTouches[0].screenX;

      var distance =
        touchEndX - touchStartX;

      if (Math.abs(distance) > 50) {

        if (distance < 0) {
          next();
        } else {
          previous();
        }
      }

      startAutoplay();

    },
    { passive: true }
  );

  /* ------------------------------------------------------------
     Keyboard navigation
     ------------------------------------------------------------ */

  document.addEventListener('keydown', function (event) {

    if (
      event.key === 'ArrowRight' &&
      document.activeElement &&
      carousel.contains(document.activeElement)
    ) {
      next();
      restartAutoplay();
    }

    if (
      event.key === 'ArrowLeft' &&
      document.activeElement &&
      carousel.contains(document.activeElement)
    ) {
      previous();
      restartAutoplay();
    }

  });

  /* ------------------------------------------------------------
     Initial state
     ------------------------------------------------------------ */

  render(false);
  startAutoplay();

})();


/* ============================================================
   5. "FROM YOUR DESK TO THE SITE" — scroll-in reveal
   The delivery feature/cards/note fade and rise into place as the
   section is scrolled into view, staggered left to right.
   ============================================================ */

function initDeliveryReveal() {
  const layout = document.querySelector('.delivery-layout');
  if (!layout) return;

  const items = Array.from(
    layout.querySelectorAll('.delivery-feature, .delivery-card, .delivery-note')
  );
  if (!items.length) return;

  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translate3d(0, 32px, 0)';
    item.style.transition =
      `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s, ` +
      `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translate3d(0, 0, 0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  items.forEach((item) => io.observe(item));
}