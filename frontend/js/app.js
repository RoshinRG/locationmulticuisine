/**
 * app.js — Global utilities: auth state, navbar, toasts, animations
 */
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:5000/api`
  : `${window.location.origin}/api`;

// ── Auth Helpers ─────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
const isLoggedIn = () => !!getToken() && !!getUser();

async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// ── Toast Notifications ───────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Auth state
  const user = getUser();
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');

  if (user && isLoggedIn()) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (userMenu) { userMenu.style.display = 'block'; }
    if (userName) userName.textContent = user.name.split(' ')[0];
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('userDropdown');
  if (dd && !e.target.closest('#userMenu')) dd.style.display = 'none';
});

// ── Mobile Menu ───────────────────────────────────────────────────────────────
function toggleMobile() {
  const links = document.getElementById('navLinks');
  const auth = document.getElementById('navAuth');
  const ham = document.getElementById('hamburger');
  if (links) links.classList.toggle('mobile-open');
  if (auth) auth.classList.toggle('mobile-open');
  if (ham) ham.classList.toggle('active');
}

// ── Loader ────────────────────────────────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 400);
    }, 100);
  }
}

// ── Counter Animation ─────────────────────────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const isFloat = target % 1 !== 0;
    const duration = 2000;
    const step = 30;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
      if (!isFloat && target >= 1000) el.textContent = Math.floor(current).toLocaleString() + '+';
    }, step);
  });
}

// ── Intersection Observer for animations ─────────────────────────────────────
function initAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    .fade-up{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}
    .fade-up.visible{opacity:1;transform:translateY(0)}
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger counter animation when stats come into view
        if (entry.target.querySelector('[data-count]')) animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.food-card, .offer-card, .review-card, .stats-inner, .section-header').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });
}

// ── Price Formatter ───────────────────────────────────────────────────────────
function formatPrice(amount) {
  return '₹' + parseFloat(amount).toFixed(0);
}

// ── Date Formatter ────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Dynamic Menu Items ────────────────────────────────────────────────────────
async function loadPopularDishes() {
  const grid = document.getElementById('popularGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/menu?popular=true&limit=8&available=true`);
    const data = await res.json();
    
    if (data.success && data.items.length > 0) {
      grid.innerHTML = data.items.map(item => `
        <div class="food-card">
          <div class="food-img-wrap">
            <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800'}" alt="${item.name}" loading="lazy">
            <div class="food-tag">${item.category}</div>
          </div>
          <div class="food-content">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:.5rem">
              <h3>${item.name}</h3>
              <div style="color:var(--gold);font-weight:700">₹${item.price}</div>
            </div>
            <p>${item.description}</p>
            <div class="food-footer">
              <div class="rating">⭐ ${item.rating || '4.5'}</div>
              <button class="btn-sm btn-gold" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Add</button>
            </div>
          </div>
        </div>
      `).join('');
      // Re-initialize animations for new elements
      initAnimations();
    } else {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">Check back soon for our popular dishes!</p>';
    }
  } catch (err) {
    console.error('Failed to load popular dishes:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">Failed to load menu. Please refresh.</p>';
  }
}

// Global addToCart stub (will be defined in cart.js if present)
window.addToCart = window.addToCart || function(id, name, price) {
  showToast(`Added ${name} to cart!`, 'success');
  // Trigger event for cart.js if it exists
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { id, name, price } }));
};

// ── Init on DOM Ready ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  hideLoader();
  initAnimations();
  
  if (document.getElementById('popularGrid')) {
    loadPopularDishes();
  }
});
