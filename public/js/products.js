// Relies on CATALOG_PRODUCTS / CATALOG_CATEGORIES from catalog-data.js as the
// offline fallback, and prefers the live API when a backend is running.

async function fetchAllProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data;
    throw new Error('empty');
  } catch (e) {
    return typeof CATALOG_PRODUCTS !== 'undefined' ? CATALOG_PRODUCTS : [];
  }
}

async function fetchAllCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data;
    throw new Error('empty');
  } catch (e) {
    return typeof CATALOG_CATEGORIES !== 'undefined' ? CATALOG_CATEGORIES : [];
  }
}

function productCard(p) {
  return `
    <div class="product-card" data-category="${p.categorySlug}">
      <a href="product-detail.html?id=${encodeURIComponent(p.id)}">
        <div class="thumb"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      </a>
      <div class="info">
        <h3>${p.name}</h3>
        <p class="tag">${p.tagline || ''}</p>
        <p style="font-weight:500;margin-bottom:10px;">M.R.P. : ${Number(p.mrp).toFixed(2)}</p>
        <a href="product-detail.html?id=${encodeURIComponent(p.id)}" class="view-btn">VIEW DETAILS</a>
      </div>
    </div>`;
}

// ---------- Home page: a curated best-seller strip ----------
const FEATURED_IDS = [
  'ptmt-crystal-short-body-90',
  'pprc-m-series-short-body',
  'ptmt-health-faucet-health-faucets',
  'ptmt-health-faucet-connection-pipe',
  'ptmt-health-faucet-butterfly-jet-spray',
];

async function renderFeatured(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const products = await fetchAllProducts();
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const picks = FEATURED_IDS.map(id => byId[id]).filter(Boolean);
  const list = picks.length ? picks : products.slice(0, 5);
  el.innerHTML = list.map(productCard).join('');
}

// ---------- Sidebar: CATEGORIES / Need Help / Available Colours ----------
async function renderCategorySidebar(containerId, activeSlug) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const categories = await fetchAllCategories();
  const groups = {};
  categories.forEach(c => {
    groups[c.group] = groups[c.group] || [];
    groups[c.group].push(c);
  });

  const groupHtml = Object.entries(groups).map(([groupName, cats]) => `
    <div class="cat-group">
      <h4>${groupName}</h4>
      <ul>
        ${cats.map(c => `<li><a href="series.html?series=${c.slug}" class="${c.slug === activeSlug ? 'active' : ''}">${c.shortName}</a></li>`).join('')}
      </ul>
    </div>`).join('');

  const activeCategory = categories.find(c => c.slug === activeSlug);
  const colors = (activeCategory && activeCategory.colors) || [];
  const coloursCardHtml = colors.length
    ? `
    <div class="sidebar-card colours-card">
      <h3>Available Colours</h3>
      <p class="colours-for">${activeCategory.shortName}</p>
      <div class="colour-swatch-stack">
        ${colors.map(c => `
          <button type="button" class="colour-swatch-box" data-image="${c.image}" data-color="${c.name}" data-series="${activeCategory.shortName}">
            <img src="${c.image}" alt="${activeCategory.shortName} in ${c.name}" loading="lazy">
            <span class="colour-swatch-label">${c.name}</span>
          </button>`).join('')}
      </div>
    </div>` : '';

  el.innerHTML = `
    <div class="sidebar-card categories-card">
      <h3>CATEGORIES</h3>
      ${groupHtml}
    </div>
    <div class="sidebar-card need-help-card">
      <h3>Need Help?</h3>
      <p>Let our product experts help you to find the right solution.</p>
      <a href="contact.html" class="btn btn-white">CONTACT US</a>
    </div>
    ${coloursCardHtml}`;

  el.querySelectorAll('.colour-swatch-box').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('active');
      el.querySelectorAll('.colour-swatch-box').forEach(b => b.classList.remove('active'));

      const grid = document.getElementById('series-grid') || document.getElementById('related-products');
      const note = document.getElementById('colour-view-note');

      if (isActive) {
        // Clicking the already-selected colour again goes back to each product's own photo.
        restoreProductGridImages(grid);
        if (note) note.textContent = '';
        return;
      }

      btn.classList.add('active');
      showProductGridInColour(grid, btn.dataset.image, btn.dataset.color);
      if (note) {
        note.textContent = `Showing ${btn.dataset.series} in ${btn.dataset.color}. Click the colour again to go back.`;
      }
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Swap every product card's photo in the grid to the selected colour's photo,
// remembering each card's original photo so it can be restored later.
function showProductGridInColour(grid, colourImage, colourName) {
  if (!grid) return;
  grid.querySelectorAll('.product-card .thumb img').forEach(img => {
    if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;
    img.src = colourImage;
    img.alt = `${img.alt.replace(/ \(.*\)$/, '')} (${colourName})`;
  });
}

// Restore each product card's own photo (undo showProductGridInColour).
function restoreProductGridImages(grid) {
  if (!grid) return;
  grid.querySelectorAll('.product-card .thumb img').forEach(img => {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
      img.alt = img.alt.replace(/ \(.*\)$/, '');
      delete img.dataset.originalSrc;
    }
  });
}

// ---------- Colour swatch lightbox (click a colour to view it larger) ----------
function openColourLightbox(image, colorName, seriesName) {
  let overlay = document.getElementById('colour-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'colour-lightbox';
    overlay.className = 'colour-lightbox';
    overlay.innerHTML = `
      <div class="colour-lightbox-inner">
        <button type="button" class="colour-lightbox-close" aria-label="Close">&times;</button>
        <img alt="">
        <p class="colour-lightbox-caption"></p>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('colour-lightbox-close')) {
        overlay.classList.remove('open');
        document.querySelectorAll('.colour-swatch-box.active').forEach(b => b.classList.remove('active'));
        const note = document.getElementById('colour-view-note');
        if (note) note.textContent = '';
      }
    });
  }
  overlay.querySelector('img').src = image;
  overlay.querySelector('img').alt = `${seriesName} in ${colorName}`;
  overlay.querySelector('.colour-lightbox-caption').textContent = `${seriesName} — ${colorName}`;
  overlay.classList.add('open');
}

// ---------- Series listing page (e.g. PTMT Crystal Series) ----------
async function renderSeriesPage() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('series') || 'ptmt-crystal';

  const [products, categories] = await Promise.all([fetchAllProducts(), fetchAllCategories()]);
  const category = categories.find(c => c.slug === slug) || categories[0];
  const items = products.filter(p => p.categorySlug === slug);

  document.title = `${category.name} | Drop Flow`;
  document.getElementById('series-title').textContent = category.shortName.toUpperCase();
  document.getElementById('series-grid').innerHTML = items.map(productCard).join('');

  renderCategorySidebar('series-sidebar', slug);
}

// ---------- Products hub (all categories overview) ----------
async function renderCategoryHub(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const categories = await fetchAllCategories();
  const groups = {};
  categories.forEach(c => {
    groups[c.group] = groups[c.group] || [];
    groups[c.group].push(c);
  });

  el.innerHTML = Object.entries(groups).map(([groupName, cats]) => `
    <div class="hub-group">
      <h3>${groupName}</h3>
      <div class="hub-grid">
        ${cats.map(c => `
          <a href="series.html?series=${c.slug}" class="hub-card">
            ${c.image ? `<div class="hub-card-thumb"><img src="${c.image}" alt="${c.name}"></div>` : ''}
            <h4>${c.name}</h4>
            <span>View Products &rarr;</span>
          </a>`).join('')}
      </div>
    </div>`).join('');
}

// ---------- Product detail helpers: description / specs / features ----------
function materialInfoFor(categorySlug) {
  if (categorySlug.startsWith('ptmt')) {
    return {
      material: 'PTMT (Poly Tetra Methyl Thelene)',
      materialNote: 'a high-strength engineering plastic valued for its rigidity and rust-free finish',
    };
  }
  if (categorySlug.startsWith('pprc')) {
    return {
      material: 'PPRC (Poly Propylene Random Copolymer)',
      materialNote: 'a lightweight, chemical-resistant plastic that keeps its shape and colour over years of use',
    };
  }
  return {
    material: 'PVC / ABS Grade Plastic',
    materialNote: 'a food-safe, corrosion-proof plastic built for constant water contact',
  };
}

function featuresFor(group) {
  if (group === 'PTMT Series') {
    return ['Rust &amp; corrosion resistant', 'High-grade PTMT construction', 'Smooth 360&deg; handle operation', 'Leak-proof washer seal'];
  }
  if (group === 'PPRC Series') {
    return ['Lightweight, durable PPRC body', 'Chemical &amp; corrosion resistant', 'Consistent, smooth water flow', 'Easy DIY installation'];
  }
  return ['Ergonomic, easy-grip design', 'Kink-resistant fittings', 'Universal thread compatibility', 'Smooth, reliable action'];
}

function descriptionFor(product, category) {
  const { material, materialNote } = materialInfoFor(product.categorySlug);
  return `The Drop Flow ${product.name} from our ${category.name} is built using ${material}, ${materialNote}. `
    + `Designed for ${category.group === 'Accessories' ? 'everyday bathroom and kitchen use' : 'kitchens and bathrooms alike'}, `
    + `it delivers smooth, consistent water flow with a ${(product.tagline || 'reliable, long-lasting').toLowerCase()} finish that fits comfortably into any modern home.`;
}

// ---------- Product detail ----------
async function renderProductDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const [products, categories] = await Promise.all([fetchAllProducts(), fetchAllCategories()]);
  const product = products.find(p => p.id === id) || products[0];
  if (!product) return;
  const category = categories.find(c => c.slug === product.categorySlug) || { name: product.category, group: '' };

  document.title = `${product.name} | Drop Flow`;
  document.getElementById('detail-image').src = product.image;
  document.getElementById('detail-image').alt = product.name;
  document.getElementById('detail-category').textContent = product.category.toUpperCase();
  document.getElementById('detail-name').textContent = product.name;
  document.getElementById('detail-tagline').textContent = product.tagline || '';
  document.getElementById('detail-mrp').textContent = `M.R.P. : ${Number(product.mrp).toFixed(2)}`;

  const descEl = document.getElementById('detail-description');
  if (descEl) descEl.textContent = descriptionFor(product, category);

  const { material } = materialInfoFor(product.categorySlug);
  const specsEl = document.getElementById('detail-specs');
  if (specsEl) {
    const rows = [
      ['Series', category.name],
      ['Category Group', category.group || '—'],
      ['Material', material],
      ['Product Type', product.name],
      ['M.R.P.', `Rs. ${Number(product.mrp).toFixed(2)}`],
      ['Warranty', '1 Year Manufacturer Warranty'],
    ];
    specsEl.querySelector('tbody').innerHTML = rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }

  const featuresEl = document.getElementById('detail-features');
  if (featuresEl) {
    featuresEl.innerHTML = featuresFor(category.group)
      .map(f => `<li>${f}</li>`).join('');
  }

  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 5);
  const relatedEl = document.getElementById('related-products');
  if (relatedEl) relatedEl.innerHTML = related.map(productCard).join('');

  renderCategorySidebar('detail-sidebar', product.categorySlug);
}
