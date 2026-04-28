/**
 * cart.js — Shopping cart state management
 */
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const DELIVERY_CHARGE = 40;
const GST_RATE = 0.05;
let appliedCoupon = null;
const COUPONS = { 'WELCOME10': 0.10, 'LOCATION20': 0.20, 'FIRSTORDER': 0.15 };

// ── Cart State ────────────────────────────────────────────────────────────────
function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function addToCart(item) {
  const idx = cart.findIndex(c => c.menuItemId === item.menuItemId);
  if (idx > -1) {
    cart[idx].quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${item.name} added to cart 🛒`, 'success');
}

function removeFromCart(menuItemId) {
  cart = cart.filter(c => c.menuItemId !== menuItemId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQty(menuItemId, qty) {
  const idx = cart.findIndex(c => c.menuItemId === menuItemId);
  if (idx > -1) {
    if (qty <= 0) { removeFromCart(menuItemId); return; }
    cart[idx].quantity = qty;
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function clearCart() { cart = []; saveCart(); updateCartUI(); renderCartItems(); }

// ── Totals Calculation ────────────────────────────────────────────────────────
function calcTotals(orderType = 'delivery') {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    discount = subtotal * COUPONS[appliedCoupon];
  }
  const taxable = subtotal - discount;
  const tax = taxable * GST_RATE;
  const delivery = orderType === 'delivery' ? DELIVERY_CHARGE : 0;
  const total = taxable + tax + delivery;
  return { subtotal, discount, tax, delivery, total };
}

// ── UI Updates ────────────────────────────────────────────────────────────────
function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.quantity, 0);
  // Sidebar badge
  ['cartCountNav', 'floatCartCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
  // Float button visibility
  const floatBtn = document.getElementById('floatCartBtn');
  if (floatBtn) floatBtn.style.display = count > 0 ? 'flex' : 'none';
  // Cart footer
  const footer = document.getElementById('cartFooter');
  if (footer) footer.style.display = cart.length > 0 ? 'block' : 'none';
  // Update sidebar totals
  updateSidebarTotals();
}

function updateSidebarTotals() {
  const t = calcTotals();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = formatPrice(val); };
  set('cartSubtotal', t.subtotal);
  set('cartTax', t.tax);
  set('cartDelivery', t.delivery);
  set('cartTotal', t.total);
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:.8rem">Add delicious items from our menu!</p>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div style="width:70px;height:70px;border-radius:8px;background:var(--dark-3);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0">${getCatEmoji(item.category)}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty('${item.menuItemId}', ${item.quantity - 1})">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty('${item.menuItemId}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${item.menuItemId}')" title="Remove">🗑️</button>
    </div>`).join('');
}

function getCatEmoji(cat) {
  const map = { 
    biryani:'🍛', shawarma:'🥙', grills:'🍢', seafood:'🦐', starters:'🥗', 
    desserts:'🧆', drinks:'🥛', 'south-indian':'🌴', 'north-indian':'🥘',
    chinese:'🥢', veg:'🥦', mandi:'🍚', broasted:'🍗' 
  };
  return map[cat] || '🍽️';
}

// ── Cart Sidebar ──────────────────────────────────────────────────────────────
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
  updateCartUI();
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function openCheckout() {
  if (!isLoggedIn()) {
    showToast('Please login to place your order', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  closeCart();
  renderOrderSummary();
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderOrderSummary() {
  const container = document.getElementById('orderSummaryItems');
  if (!container) return;
  container.innerHTML = cart.map(item => `
    <div class="order-summary-item">
      <span>${item.name} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>`).join('');
  updateCheckoutTotals();
}

function updateCheckoutTotals() {
  const type = document.getElementById('orderType')?.value || 'delivery';
  const t = calcTotals(type);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = formatPrice(val); };
  set('mo-subtotal', t.subtotal);
  set('mo-tax', t.tax);
  set('mo-delivery', t.delivery);
  set('mo-discount', t.discount);
  set('mo-total', t.total);
}

function updateDeliveryFields() {
  const type = document.getElementById('orderType').value;
  const fields = document.getElementById('deliveryFields');
  if (fields) fields.style.display = type === 'delivery' ? 'block' : 'none';
  updateCheckoutTotals();
}

function applyCoupon() {
  const code = document.getElementById('couponInput')?.value.trim().toUpperCase();
  if (!code) { showToast('Enter a coupon code', 'error'); return; }
  if (COUPONS[code]) {
    appliedCoupon = code;
    document.getElementById('couponSuccess').style.display = 'flex';
    showToast(`Coupon ${code} applied! ${(COUPONS[code]*100)}% off 🎉`, 'success');
    updateCheckoutTotals();
  } else {
    showToast('Invalid coupon code', 'error');
    appliedCoupon = null;
  }
}

async function placeOrder() {
  const token = getToken();
  const orderType = document.getElementById('orderType').value;
  const street = document.getElementById('deliveryStreet')?.value.trim();
  const pincode = document.getElementById('deliveryPincode')?.value.trim();
  const landmark = document.getElementById('deliveryLandmark')?.value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const notes = document.getElementById('orderNotes')?.value.trim();

  if (orderType === 'delivery' && !street) {
    showToast('Please enter your delivery address', 'error'); return;
  }

  const payload = {
    items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
    deliveryAddress: { street, pincode, landmark },
    orderType,
    paymentMethod,
    notes,
    couponCode: appliedCoupon || ''
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeCheckout();
      document.getElementById('successOrderNum').textContent = data.order.orderNumber;
      document.getElementById('successModal').classList.add('open');
      clearCart();
      appliedCoupon = null;
    } else {
      showToast(data.message || 'Order failed. Please try again.', 'error');
    }
  } catch {
    showToast('Server error. Please try again.', 'error');
  }
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderCartItems();
});
