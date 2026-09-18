// ============================================================
// MISS WAKEY KITCHEN — menu.js
// Builds the whole menu page (category nav + dish grids) from the
// `dishes` list below. To add, remove, or re-tag a dish, edit that
// list only — the categories, nav, and grids all rebuild themselves
// around it. No HTML editing required.
// ============================================================

// Controls the order categories appear in when they're present.
// Any category used below that ISN'T in this list still renders —
// it's just appended after these, in the order it first appears.
const CATEGORY_ORDER = [
  'Mains',
  'Coastal Specialties',
  'Sides & Vegetables',
  'Breakfast',
];

// Short line shown above each category heading. Falls back to the
// category name itself if one isn't listed here.
const CATEGORY_EYEBROWS = {
  'Mains': 'Everyday favourites',
  'Coastal Specialties': 'From the coast',
  'Sides & Vegetables': 'On the side',
  'Breakfast': 'To start the day',
};

// ------------------------------------------------------------
// THE MENU — add a dish by adding an object here.
// Required: name, category, description, image.
// Optional: tag (small badge on the card), price (shown if set).
// ------------------------------------------------------------
// Prices are KES, set to sit in line with what Nairobi's casual
// eateries and home-delivery kitchens typically charge for these
// dishes — adjust freely to match your own costing.
const dishes = [
  {
    name: 'Pilau na Nyama',
    category: 'Coastal Specialties',
    tag: 'Rice dish',
    description: 'Spiced rice slow-cooked with beef, served with kachumbari.',
    image: 'images-webp/food/pilau.webp',
    price: 'KES 350',
  },
  {
    name: 'Ugali na Nyama Choma',
    category: 'Mains',
    tag: 'Everyday favorite',
    description: 'Ugali served with stewed meat and shredded cabbage.',
    image: 'images-webp/food/ugali-nyama.webp',
    price: 'KES 400',
  },
  {
    name: 'Mukimo',
    category: 'Mains',
    tag: 'Upcountry classic',
    description: 'Mashed potatoes, maize, beans and greens, mashed together.',
    image: 'images-webp/food/mukimo.webp',
    price: 'KES 300',
  },
  {
    name: 'Maharagwe ya Nazi',
    category: 'Coastal Specialties',
    tag: 'Coastal classic',
    description: 'Red beans simmered in fresh coconut milk, cooked slow.',
    image: 'images-webp/food/maharagwe.webp',
    price: 'KES 250',
  },
  {
    name: 'Samaki wa Kupaka',
    category: 'Coastal Specialties',
    tag: 'Fish',
    description: 'Whole fried tilapia with fresh tomato-onion kachumbari.',
    image: 'images-webp/food/samaki.webp',
    price: 'KES 450',
  },
  {
    name: 'Sukuma Wiki',
    category: 'Sides & Vegetables',
    tag: 'Side',
    description: 'Collard greens sautéed with onion and tomato.',
    image: 'images-webp/food/sukuma.webp',
    price: 'KES 100',
  },
  {
    name: 'Chapati',
    category: 'Sides & Vegetables',
    tag: 'Side',
    description: 'Soft layered flatbread, made fresh daily.',
    image: 'images-webp/food/chapati.webp',
    price: 'KES 50',
  },
  {
    name: 'Mahamri na Maharagwe',
    category: 'Breakfast',
    tag: 'Breakfast',
    description: 'Coconut-sweetened fried bread with spiced bean stew.',
    image: 'images-webp/food/mahamri.webp',
    price: 'KES 200',
  },
  {
    name: 'Chai Mandazi',
    category: 'Breakfast',
    tag: 'Breakfast',
    description: 'Mandazi, savory omelette, tea, and warm morning hospitality.',
    image: 'images-webp/food/Eggs-Tea.webp',
    price: 'KES 100',
  },
  {
    name: 'Uji Power',
    category: 'Breakfast',
    tag: 'Porridge',
    description: 'Warm fermented millet porridge, lightly spiced.',
    image: 'images-webp/food/uji.webp',
    price: 'KES 100',
  },
  {
  name: 'Fried Fish with Ugali',
  category: 'Mains',
  tag: 'Traditional',
  description: 'Crispy fried tilapia served with firm maize meal ugali and sautéed sukuma wiki.',
  image: 'images-webp/food/fish.webp',
  price: 'KES 150',
  },
];


document.addEventListener('DOMContentLoaded', () => {
  const categoriesRoot = document.querySelector('[data-menu-categories]');
  const navRoot = document.querySelector('[data-menu-nav]');
  if (!categoriesRoot) return;

  const grouped = groupByCategory(dishes);
  const orderedCategories = orderCategories(grouped);

  renderNav(navRoot, orderedCategories);
  renderCategories(categoriesRoot, grouped, orderedCategories);
  initRevealOnScroll();
  if (navRoot) initActiveNavHighlight(navRoot, orderedCategories);
});


/* ---------------- Grouping / ordering ---------------- */

function groupByCategory(items) {
  return items.reduce((acc, dish) => {
    const key = dish.category || 'More';
    (acc[key] = acc[key] || []).push(dish);
    return acc;
  }, {});
}

function orderCategories(grouped) {
  const known = CATEGORY_ORDER.filter((c) => grouped[c]);
  const unknown = Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c));
  return [...known, ...unknown];
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


/* ---------------- Rendering ---------------- */

function renderNav(navRoot, categories) {
  if (!navRoot || categories.length < 2) return; // no point in a nav for one section

  navRoot.innerHTML = categories.map((category) => `
    <a href="#${slugify(category)}" class="menu-nav__link" data-menu-nav-link="${slugify(category)}">
      ${category}
    </a>
  `).join('');
}

function renderCategories(root, grouped, categories) {
  root.innerHTML = categories.map((category) => `
    <section class="menu-category" id="${slugify(category)}">
      <div class="container">
        <div class="menu-category__head">
          <p class="eyebrow">${CATEGORY_EYEBROWS[category] || category}</p>
          <h2>${category}</h2>
        </div>
        <div class="menu-grid">
          ${grouped[category].map(dishCardHtml).join('')}
        </div>
      </div>
    </section>
  `).join('');
}

function dishCardHtml(dish) {
  return `
    <article class="dish-card">
      <img src="${dish.image}" alt="${dish.name}" loading="lazy">
      <div class="dish-card__overlay">
        <div class="dish-card__row">
          ${dish.tag ? `<span class="dish-card__tag">${dish.tag}</span>` : '<span></span>'}
          ${dish.price ? `<span class="dish-card__price">${dish.price}</span>` : ''}
        </div>
        <h3 class="dish-card__name">${dish.name}</h3>
        <p class="dish-card__desc">${dish.description}</p>
      </div>
    </article>
  `;
}


/* ---------------- Scroll reveal for dish cards ---------------- */

function initRevealOnScroll() {
  const cards = document.querySelectorAll('.dish-card');
  if (!cards.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition =
      'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      // Small stagger based on position within its own grid row-ish
      // group, without needing to track indices globally.
      const siblings = Array.from(card.parentElement.children);
      const delay = siblings.indexOf(card) * 0.06;
      window.setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, delay * 1000);
      io.unobserve(card);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  cards.forEach((card) => io.observe(card));
}


/* ---------------- Highlight active category in the nav ---------------- */

function initActiveNavHighlight(navRoot, categories) {
  const links = navRoot.querySelectorAll('[data-menu-nav-link]');
  if (!links.length) return;

  const sections = categories
    .map((c) => document.getElementById(slugify(c)))
    .filter(Boolean);

  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.menuNavLink === id);
      });
    });
  }, { threshold: 0.4, rootMargin: '-96px 0px -55% 0px' });

  sections.forEach((section) => io.observe(section));
}