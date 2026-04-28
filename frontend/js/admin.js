/**
 * admin.js — Shared admin utilities: sidebar, auth guard, toast, API helpers
 */
const ADMIN_API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:5000/api`
  : `${window.location.origin}/api`;

let lastOrderCount = -1;

function getAdminToken() { return localStorage.getItem('token'); }
function getAdminUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }

function adminAuthGuard() {
  const token = getAdminToken();
  const user = getAdminUser();
  if (!token || !user || user.role !== 'admin') {
    window.location.href = '../login.html'; // Path adjusted for admin folder
    return false;
  }
  return true;
}

async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  return fetch(ADMIN_API + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

function adminLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
}

function showAdminToast(msg, type = 'info') {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '🔔', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:var(--card-bg, #1a1a1a);border:1px solid var(--border, rgba(201,168,76,0.3));border-radius:10px;padding:1rem 1.5rem;display:flex;align-items:center;gap:.75rem;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:slideInAdmin .3s ease;color:white;font-size:.9rem;min-width:280px`;
  if (type === 'success') toast.style.borderLeft = '4px solid #4caf50';
  if (type === 'error') toast.style.borderLeft = '4px solid #e53935';
  if (type === 'info') toast.style.borderLeft = '4px solid #c9a84c';

  toast.innerHTML = `<span>${icons[type] || '🔔'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  
  // Slide in animation
  const style = document.createElement('style');
  style.textContent = '@keyframes slideInAdmin{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
  document.head.appendChild(style);

  setTimeout(() => { 
    toast.style.opacity = '0'; 
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .4s ease'; 
    setTimeout(() => toast.remove(), 400); 
  }, 4000);
}

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(d) {
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Sidebar toggle for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('show');
}

async function initAdminSidebar() {
  const user = getAdminUser();
  if (!user) return;
  const nameEl = document.getElementById('adminUserName');
  const roleEl = document.getElementById('adminUserRole');
  const avatarEl = document.getElementById('adminAvatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = 'Administrator';
  if (avatarEl) avatarEl.textContent = user.name?.charAt(0)?.toUpperCase() || 'A';

  // Highlight active link
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // Fetch badges/counts
  try {
    const res = await adminFetch('/admin/dashboard');
    const data = await res.json();
    if (data.success) {
      const { stats } = data;
      const orderBadge = document.getElementById('pendingOrdersBadge');
      const resBadge = document.getElementById('pendingResBadge');
      if (orderBadge && stats.activeOrders > 0) orderBadge.textContent = stats.activeOrders;
      if (resBadge && stats.pendingReservations > 0) resBadge.textContent = stats.pendingReservations;
    }
  } catch (err) { console.warn('Sidebar count fetch failed'); }
}

// Simple bar chart renderer
function renderBarChart(containerId, data, color = 'var(--gold)') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const max = Math.max(...data.map(d => d.value), 1);
  container.innerHTML = data.map(d => `
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.max((d.value / max) * 100, 2)}%;background:linear-gradient(180deg,${color},rgba(201,168,76,.2))"></div>
      <span>${d.label}</span>
    </div>`).join('');
}

async function checkNewOrders() {
  try {
    const res = await adminFetch('/admin/dashboard');
    const data = await res.json();
    if (data.success) {
      const currentCount = data.stats.totalOrders;
      if (lastOrderCount !== -1 && currentCount > lastOrderCount) {
        showAdminToast('New order received! 📦', 'info');
        const dot = document.querySelector('.notif-dot');
        if (dot) dot.style.display = 'block';
        // If we are on dashboard or orders page, reload data
        if (typeof loadDashboard === 'function') loadDashboard();
        if (typeof loadOrders === 'function') loadOrders();
      }
      lastOrderCount = currentCount;
    }
  } catch (err) { console.warn('Polling failed'); }
}

function startNotificationPolling() {
  checkNewOrders();
  setInterval(checkNewOrders, 10000); // Check every 10 seconds
}

document.addEventListener('DOMContentLoaded', () => {
  if (!adminAuthGuard()) return;
  initAdminSidebar();
  startNotificationPolling();
});
