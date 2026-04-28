/**
 * menu.js — Fetches and renders menu items, handles search/filter
 */
let allItems = [];
let currentCategory = 'all';
let searchQuery = '';
let sortBy = '';
let searchTimer = null;
const user = getUser();
const wishlist = user ? (JSON.parse(localStorage.getItem('wishlist') || '[]')) : [];

// ── Fetch Menu ────────────────────────────────────────────────────────────────
async function loadMenu() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)"><div class="spinner" style="margin:0 auto 1rem"></div><p>Loading menu...</p></div>`;

  // Check URL params for initial category
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) {
    currentCategory = params.get('cat');
    document.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === currentCategory);
    });
  }

  try {
    const res = await fetch(`${API_BASE}/menu?limit=100`);
    const data = await res.json();
    if (data.success) {
      allItems = data.items;
      renderMenu();
    } else {
      renderFallback();
    }
  } catch {
    renderFallback();
  }
}

function renderFallback() {
  // Show offline fallback data
  allItems = [
    { id:'f1', name:'Malabar Chicken Biryani', category:'biryani', price:299, description:'Fragrant basmati rice with tender chicken and Kerala spices', rating:4.9, isAvailable:true, isPopular:true, preparationTime:35 },
    { id:'f2', name:'Chicken Shawarma', category:'shawarma', price:149, description:'Classic chicken shawarma with garlic sauce and pickles', rating:4.8, isAvailable:true, isPopular:true, preparationTime:10, image:'images/shawarma.png' },
    { id:'f3', name:'Mixed Grill Platter', category:'grills', price:699, description:'Assortment of kebabs, lamb chops, chicken tikka and seekh kebab', rating:4.9, isAvailable:true, isPopular:true, preparationTime:35 },
    { id:'f4', name:'Mutton Dum Biryani', category:'biryani', price:379, description:'Slow-cooked mutton with saffron rice and aromatic spices', rating:4.9, isAvailable:true, isPopular:true, preparationTime:45 },
    { id:'f5', name:'Prawn Masala', category:'seafood', price:449, description:'Jumbo prawns in rich coconut-tomato masala, South Indian style', rating:4.9, isAvailable:true, isPopular:true, preparationTime:25 },
    { id:'f6', name:'Hummus with Pita', category:'starters', price:149, description:'Creamy chickpea dip with warm pita bread, drizzled with olive oil', rating:4.8, isAvailable:true, isPopular:true, preparationTime:10 },
    { id:'f7', name:'Baklava', category:'desserts', price:129, description:'Flaky pastry with pistachio filling, soaked in rose water syrup', rating:4.9, isAvailable:true, isPopular:true, preparationTime:5 },
    { id:'f8', name:'Fresh Lemon Mint', category:'drinks', price:79, description:'Refreshing blended lemon with fresh mint and crushed ice', rating:4.7, isAvailable:true, isPopular:true, preparationTime:5 },
    { id:'f9', name:'Lamb Chops', category:'grills', price:479, description:'Tender lamb chops marinated in Middle Eastern spices, charcoal grilled', rating:4.9, isAvailable:true, isPopular:true, preparationTime:30 },
    { id:'f10', name:'Mutton Shawarma', category:'shawarma', price:179, description:'Tender mutton shawarma with spiced yogurt and fresh vegetables', rating:4.7, isAvailable:true, isPopular:false, preparationTime:10, image:'images/shawarma.png' },
    { id:'f11', name:'Prawn Biryani', category:'biryani', price:349, description:'Jumbo prawns cooked with Malabar spices and fragrant basmati rice', rating:4.8, isAvailable:true, isPopular:true, preparationTime:40 },
    { id:'f12', name:'Umm Ali', category:'desserts', price:149, description:'Egyptian bread pudding with nuts, raisins, cream — served warm', rating:4.8, isAvailable:true, isPopular:true, preparationTime:15 },
    { id:'f13', name:'Arabic Mutton Kabsa', category:'biryani', price:399, description:'Traditional Saudi rice dish with tender mutton, raisins, and almonds', rating:4.9, isAvailable:true, isPopular:true, preparationTime:40, image:'images/hero.png' },
    { id:'f14', name:'Malabar Fish Curry', category:'seafood', price:329, description:'Traditional Kerala style fish curry with coconut milk and tamarind', rating:4.8, isAvailable:true, isPopular:true, preparationTime:25, image:'images/hero.png' },
    { id:'f15', name:'Tabbouleh Salad', category:'starters', price:159, description:'Fresh parsley salad with bulgur wheat, tomatoes, and lemon dressing', rating:4.7, isAvailable:true, isPopular:false, preparationTime:10, image:'images/hero.png' },
    { id:'f16', name:'Mutabal', category:'starters', price:149, description:'Smoky roasted eggplant dip with tahini and pomegranate seeds', rating:4.8, isAvailable:true, isPopular:false, preparationTime:10, image:'images/hero.png' },
  ];
  renderMenu();
  showToast('Showing offline menu. Connect server for live data.', 'info');
}

// ── Render Menu ───────────────────────────────────────────────────────────────
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const noResults = document.getElementById('noResults');

  let filtered = allItems;

  if (currentCategory !== 'all') {
    filtered = filtered.filter(i => i.category === currentCategory);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  }
  if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'popular') filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'flex';
    return;
  }
  noResults.style.display = 'none';

  const catEmojis = { biryani:'🍛', shawarma:'🥙', grills:'🍢', seafood:'🦐', starters:'🥗', desserts:'🧆', drinks:'🥛' };
  const inWish = (id) => wishlist.includes(id);

  grid.innerHTML = filtered.map((item, i) => `
    <div class="menu-card" style="animation:fadeUp .5s ease ${i * 0.05}s both">
      <div class="menu-card-img">
        ${item.image ? 
          `<img src="${item.image}" alt="${item.name}" style="width:100%;height:210px;object-fit:cover" loading="lazy">` : 
          `<div style="height:210px;background:linear-gradient(135deg,#1a1a1a,#252525);display:flex;align-items:center;justify-content:center;font-size:4rem">
            ${catEmojis[item.category] || '🍽️'}
          </div>`
        }
        ${!item.isAvailable ? '<div class="unavailable-overlay"><span>Currently Unavailable</span></div>' : ''}
        ${item.isPopular ? '<div class="popular-badge">⭐ Popular</div>' : ''}
        <div class="prep-time">⏱️ ${item.preparationTime} min</div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-cat">${item.category}</div>
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-meta">
          <div class="price">₹${item.price} <span>/serving</span></div>
          <div class="rating"><span class="star">★</span>${item.rating.toFixed(1)}</div>
        </div>
        <div class="card-actions">
          <div class="qty-group">
            <button onclick="changeQty('${item.id}', -1)">−</button>
            <span id="qty-${item.id}">1</span>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
          <button class="add-cart-btn" onclick="handleAddToCart('${item.id}')" ${!item.isAvailable ? 'disabled' : ''}>
            🛒 Add
          </button>
          <button class="wishlist-btn ${inWish(item.id) ? 'active' : ''}" onclick="toggleWish('${item.id}', this)" title="Wishlist">
            ${inWish(item.id) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>`).join('');
}

// ── Quantity Selector ─────────────────────────────────────────────────────────
function changeQty(itemId, delta) {
  const el = document.getElementById(`qty-${itemId}`);
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  if (val > 20) val = 20;
  el.textContent = val;
}

function handleAddToCart(itemId) {
  const qty = parseInt(document.getElementById(`qty-${itemId}`).textContent) || 1;
  const item = allItems.find(i => (i.id || i.id) === itemId);
  if (!item) return;
  addToCart({ menuItemId: item.id || item.id, name: item.name, price: item.price, category: item.category, quantity: qty });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
async function toggleWish(itemId, btn) {
  if (!isLoggedIn()) { showToast('Please login to save favourites', 'error'); return; }
  const idx = wishlist.indexOf(itemId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    btn.innerHTML = '🤍'; btn.classList.remove('active');
    showToast('Removed from wishlist', 'info');
  } else {
    wishlist.push(itemId);
    btn.innerHTML = '❤️'; btn.classList.add('active');
    showToast('Added to wishlist ❤️', 'success');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  // Sync with server
  try {
    await authFetch(`${API_BASE}/auth/wishlist/${itemId}`, { method: 'POST' });
  } catch {}
}

// ── Filters ───────────────────────────────────────────────────────────────────
function selectCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMenu();
}

function applyFilters() {
  sortBy = document.getElementById('sortSelect')?.value || '';
  renderMenu();
}

function debounceSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = val;
    renderMenu();
  }, 300);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadMenu);
