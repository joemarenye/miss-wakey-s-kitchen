// ============================================================
// Frame-sequence "video" player.
//
// Point it at a numbered set of AI-generated (or real) stills and
// it cross-fades between them on a timer, or scrubs by scroll
// position if data-scrub is set. This is how we fake "video" using
// only still frames — no actual video file involved.
//
// Markup:
// <div class="frame-sequence"
//      data-frame-sequence
//      data-src="images/process/coconut"
//      data-count="6"
//      data-ext="jpg"
//      data-interval="900">
// </div>
//
// Frame files must be named coconut-01.jpg ... coconut-06.jpg
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-frame-sequence]').forEach(setupSequence);
});

function setupSequence(el) {
  const src = el.dataset.src;
  const count = parseInt(el.dataset.count, 10) || 1;
  const ext = el.dataset.ext || 'jpg';
  const interval = parseInt(el.dataset.interval, 10) || 900;
  const scrub = el.hasAttribute('data-scrub');

  if (!src) return;

  const frames = [];
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, '0');
    const img = document.createElement('img');
    img.src = `${src}-${num}.${ext}`;
    img.alt = '';
    img.loading = i === 1 ? 'eager' : 'lazy';
    if (i === 1) img.classList.add('is-active');
    el.appendChild(img);
    frames.push(img);
  }

  if (frames.length < 2) return;

  let active = 0;
  const setActive = (index) => {
    frames[active].classList.remove('is-active');
    active = ((index % frames.length) + frames.length) % frames.length;
    frames[active].classList.add('is-active');
  };

  if (scrub) {
    // Frame advances as the element scrolls through the viewport —
    // gives a "scroll-to-scrub" video feel with zero video weight.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        window.addEventListener('scroll', () => onScrub(el, frames, setActive), { passive: true });
      });
    }, { threshold: 0 });
    io.observe(el);
  } else {
    // Auto-advance like a looping video clip
    setInterval(() => setActive(active + 1), interval);
  }
}

function onScrub(el, frames, setActive) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = 1 - Math.min(Math.max((rect.top + rect.height / 2) / (vh + rect.height), 0), 1);
  const index = Math.floor(progress * frames.length);
  setActive(index);
}
