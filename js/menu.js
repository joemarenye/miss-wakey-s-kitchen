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
    name: 'Pilau',
    category: 'Coastal Specialties',
    tag: 'Rice dish',
    description: 'Spiced rice slow-cooked with beef, served with kachumbari.',
    image: 'images-webp/food/pilau.webp',
    price: 'KES 400',
  },
  {
    name: 'Mahamri',
    category: 'Breakfast',
    tag: 'Swahili breakfast',
    description: 'Soft, lightly sweet Swahili doughnuts infused with coconut and cardamom.',
    image: 'images-webp/food/mahamri.webp',
    price: 'KES 20',
  },
  {
    name: 'Kaimati',
    category: 'Breakfast',
    tag: 'Swahili sweet',
    description: 'Golden, bite-sized Swahili dumplings with a soft centre and sweet coating.',
    image: 'images-webp/food/kaimati.webp',
    price: 'KES 20',
  },
  {
    name: 'Chapati',
    category: 'Sides & Vegetables',
    tag: 'Kenyan staple',
    description: 'Soft, layered chapati made fresh and perfect alongside your favourite stew.',
    image: 'images-webp/food/chapati.webp',
    price: 'KES 40',
  },
  {
    name: 'Bhajia',
    category: 'Sides & Vegetables',
    tag: 'Crispy snack',
    description: 'Crispy slices of potato coated in a seasoned gram-flour batter and fried golden.',
    image: 'images-webp/food/bhajia.webp',
    price: 'KES 15',
  },
  {
    name: 'Viazi Karai',
    category: 'Coastal Specialties',
    tag: 'Coastal favourite',
    description: 'Spiced potato pieces coated in a light batter, fried crisp and served with chutney.',
    image: 'images-webp/food/viazi-karai.webp',
    price: 'KES 10',
  },
  {
    name: 'Coconut Beans',
    category: 'Coastal Specialties',
    tag: 'Coconut stew',
    description: 'Tender beans simmered in a creamy coconut sauce with gentle coastal spices.',
    image: 'images-webp/food/coconut-beans.webp',
    price: 'KES 150',
  },
  {
    name: 'Kimanga',
    category: 'Mains',
    tag: 'Traditional favourite',
    description: 'A hearty traditional mash of beans and root vegetables, cooked into a comforting meal.',
    image: 'images-webp/food/kimanga.webp',
    price: 'KES 300',
  },
  {
    name: 'Pure',
    category: 'Sides & Vegetables',
    tag: 'Comforting side',
    description: 'Smooth, creamy mashed potatoes prepared simply to complement your main meal.',
    image: 'images-webp/food/puree.webp',
    price: 'KES 300',
  },
  {
    name: 'Beef & Rice',
    category: 'Mains',
    tag: 'Everyday favourite',
    description: 'Tender beef stew served with fluffy rice and a fresh side of vegetables.',
    image: 'images-webp/food/beef-rice.webp',
    price: 'KES 350',
  },
  {
    name: 'Kuku wa Nazi & Rice',
    category: 'Coastal Specialties',
    tag: 'Coconut chicken',
    description: 'Tender chicken simmered in a rich coconut sauce, served with fluffy rice.',
    image: 'images-webp/food/kuku-wa-nazi.webp',
    price: 'KES 600',
  },
  {
    name: 'Samaki wa Kupaka',
    category: 'Coastal Specialties',
    tag: 'Fish',
    description: 'Whole fried tilapia with fresh tomato-onion kachumbari.',
    image: 'images-webp/food/samaki.webp',
    price: 'KES 700',
  },
  {
    name: 'Mukimo & Beef',
    category: 'Mains',
    tag: 'Kenyan classic',
    description: 'Traditional mashed potatoes, maize and greens served with tender beef stew.',
    image: 'images-webp/food/mukimo-beef.webp',
    price: 'KES 350',
  },
  {
    name: 'Matoke & Beef',
    category: 'Mains',
    tag: 'Hearty meal',
    description: 'Soft, savoury matoke cooked with tender beef for a filling homemade meal.',
    image: 'images-webp/food/matoke-beef.webp',
    price: 'KES 400',
  },
  {
    name: 'Chai ya Iliki',
    category: 'Breakfast',
    tag: 'Cardamom tea',
    description: 'Rich Kenyan tea gently brewed with fragrant cardamom for a warm, spiced finish.',
    image: 'images-webp/food/chai-ya-iliki.webp',
    price: 'KES 70',
  },
  {
    name: 'Muhogo wa Nazi',
    category: 'Coastal Specialties',
    tag: 'Coconut cassava',
    description: 'Tender cassava cooked slowly in creamy coconut sauce with coastal spices.',
    image: 'images-webp/food/muhogo-wa-nazi.webp',
    price: 'KES 120',
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