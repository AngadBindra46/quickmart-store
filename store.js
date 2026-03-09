const $ = id => document.getElementById(id);
let products = [], categories = [], cart = JSON.parse(localStorage.getItem("qm_cart") || "[]");

const CAT_ICONS = {
  "Fruits & Vegetables": "🥬", "Dairy & Bread": "🥛", "Snacks & Munchies": "🍿",
  "Cold Drinks & Juices": "🥤", "Instant & Frozen Food": "🍜", "Tea, Coffee & Health Drinks": "☕",
  "Atta, Rice & Dal": "🌾", "Masala, Oil & More": "🌶️", "Sweet Tooth": "🍫",
  "Baby Care": "👶", "Cleaning Essentials": "🧹", "Personal Care": "🧴",
};

async function init() {
  await fetchProducts();
  renderHome();
  updateCartUI();

  $("searchInput").addEventListener("input", debounce(handleSearch, 300));
  $("searchInput").addEventListener("keydown", e => { if (e.key === "Escape") { e.target.value = ""; showView("viewHome"); } });
  $("checkoutForm").addEventListener("submit", placeOrder);
}

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
    categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  } catch { products = []; categories = []; }
}

// ─── Views ───
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo(0, 0);
}

// ─── Home ───
function renderHome() {
  $("catGrid").innerHTML = categories.map(cat => `
    <div class="cat-card" onclick="showCategory('${esc(cat)}')">
      <span class="cat-emoji">${CAT_ICONS[cat] || "📦"}</span>
      <div class="cat-name">${esc(cat)}</div>
    </div>
  `).join("");

  const featured = products.filter(p => p.stock > 0).sort(() => Math.random() - 0.5).slice(0, 12);
  $("featuredGrid").innerHTML = featured.map(renderProdCard).join("");
}

// ─── Category Page ───
function showCategory(cat) {
  showView("viewCategory");
  $("catTitle").textContent = cat;
  $("catSidebar").innerHTML = categories.map(c => `
    <div class="cat-sidebar-item ${c === cat ? 'active' : ''}" onclick="showCategory('${esc(c)}')">${CAT_ICONS[c] || "📦"} ${esc(c)}</div>
  `).join("");
  const prods = products.filter(p => p.category === cat);
  $("catProdGrid").innerHTML = prods.map(renderProdCard).join("");
}

// ─── Search ───
function handleSearch() {
  const q = $("searchInput").value.trim().toLowerCase();
  if (!q) { showView("viewHome"); return; }
  showView("viewSearch");
  const results = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
  );
  $("searchTitle").textContent = `Search results for "${q}" (${results.length})`;
  $("searchGrid").innerHTML = results.length ? results.map(renderProdCard).join("") : '<div style="padding:2rem;color:#999;text-align:center">No products found</div>';
}

// ─── Product Card ───
function renderProdCard(p) {
  const inCart = cart.find(c => c.id === p.id);
  const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const oos = p.stock <= 0;
  return `
    <div class="prod-card ${oos ? 'out-of-stock' : ''}">
      ${off > 0 ? `<span class="prod-off">${off}% OFF</span>` : ""}
      <div class="prod-img">${p.image || "📦"}</div>
      <div class="prod-name">${esc(p.name)}</div>
      <div class="prod-weight">${esc(p.weight)}</div>
      <div class="prod-bottom">
        <div class="prod-price">
          <span class="now">₹${p.price}</span>
          ${p.mrp > p.price ? `<span class="mrp">₹${p.mrp}</span>` : ""}
        </div>
        ${oos ? '<span style="font-size:0.7rem;color:#e53935;font-weight:600">Out of stock</span>' :
          inCart ? `<div class="qty-ctrl"><button onclick="changeQty('${p.id}',-1)">−</button><span>${inCart.qty}</span><button onclick="changeQty('${p.id}',1)">+</button></div>` :
          `<button class="btn-add" onclick="addToCart('${p.id}')">ADD</button>`
        }
      </div>
    </div>`;
}

// ─── Cart ───
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) return;
  const existing = cart.find(c => c.id === id);
  if (existing) { existing.qty++; } else {
    cart.push({ id: p.id, name: p.name, price: p.price, cost: p.cost || 0, qty: 1, image: p.image, weight: p.weight, category: p.category, productId: p.id });
  }
  saveCart(); refreshCurrentView();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart(); refreshCurrentView();
}

function saveCart() {
  localStorage.setItem("qm_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $("cartCount").textContent = count;
  $("cartCount").className = "cart-count" + (count > 0 ? " has-items" : "");

  if (!cart.length) {
    $("cartItems").innerHTML = '<div class="cart-empty"><span class="empty-icon">🛒</span>Your cart is empty<br><small>Add items to get started</small></div>';
    $("cartFooter").innerHTML = "";
    return;
  }

  $("cartItems").innerHTML = cart.map(c => `
    <div class="ci-row">
      <div class="ci-img">${c.image || "📦"}</div>
      <div class="ci-info"><div class="ci-name">${esc(c.name)}</div><div class="ci-weight">${esc(c.weight)}</div></div>
      <div class="qty-ctrl"><button onclick="changeQty('${c.id}',-1)">−</button><span>${c.qty}</span><button onclick="changeQty('${c.id}',1)">+</button></div>
      <div class="ci-price">₹${c.price * c.qty}</div>
    </div>
  `).join("");

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal >= 199 ? 0 : 25;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  $("cartFooter").innerHTML = `
    <div class="bill-row"><span class="label">Subtotal</span><span>₹${subtotal}</span></div>
    <div class="bill-row"><span class="label">Delivery fee</span><span>${delivery === 0 ? '<span style="color:#0c831f;font-weight:700">FREE</span>' : '₹' + delivery}</span></div>
    <div class="bill-row"><span class="label">Taxes & charges</span><span>₹${tax}</span></div>
    <div class="bill-row total"><span>Grand Total</span><span>₹${total}</span></div>
    ${delivery > 0 ? '<div style="font-size:0.68rem;color:#0c831f;margin-top:0.3rem">Add ₹' + (199 - subtotal) + ' more for free delivery</div>' : ""}
    <button class="btn-checkout" onclick="goCheckout()">Proceed to Checkout → ₹${total}</button>
  `;
}

function toggleCart() {
  $("cartOverlay").classList.toggle("open");
  $("cartDrawer").classList.toggle("open");
}

function refreshCurrentView() {
  const activeView = document.querySelector(".view.active");
  if (activeView.id === "viewHome") renderHome();
  else if (activeView.id === "viewCategory") {
    const cat = $("catTitle").textContent;
    if (cat) showCategory(cat);
  } else if (activeView.id === "viewSearch") handleSearch();
  updateCartUI();
}

// ─── Checkout ───
function goCheckout() {
  if (!cart.length) return;
  toggleCart();
  showView("viewCheckout");
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal >= 199 ? 0 : 25;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  $("checkoutSummary").innerHTML = `
    <div class="cs-title">Order Summary (${cart.reduce((s, c) => s + c.qty, 0)} items)</div>
    ${cart.map(c => `<div class="cs-item"><span class="name">${esc(c.name)} × ${c.qty}</span><span>₹${c.price * c.qty}</span></div>`).join("")}
    <hr class="cs-divider">
    <div class="cs-item"><span class="name">Subtotal</span><span>₹${subtotal}</span></div>
    <div class="cs-item"><span class="name">Delivery</span><span>${delivery === 0 ? 'FREE' : '₹' + delivery}</span></div>
    <div class="cs-item"><span class="name">Taxes</span><span>₹${tax}</span></div>
    <hr class="cs-divider">
    <div class="cs-total"><span>Total</span><span>₹${total}</span></div>
  `;
}

async function placeOrder(e) {
  e.preventDefault();
  const name = $("ckName").value.trim();
  const phone = $("ckPhone").value.trim();
  const addr = $("ckAddr").value.trim();
  const pin = $("ckPin").value.trim();
  const payMode = document.querySelector('input[name="payMode"]:checked').value;

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery = subtotal >= 199 ? 0 : 25;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name, customerPhone: phone, customerEmail: "",
        customerAddr: addr + (pin ? ", " + pin : ""),
        items: cart.map(c => ({ name: c.name, sku: "", category: c.category, qty: c.qty, price: c.price, cost: c.cost, productId: c.productId })),
        subtotal, tax, discount: 0, total, paymentMode: payMode, paymentStatus: payMode === "Cash" ? "unpaid" : "paid",
        notes: "Store order — " + payMode
      })
    });
    const order = await res.json();
    cart = [];
    saveCart();
    showOrderTracker(order);
  } catch (err) {
    alert("Failed to place order. Please try again.");
  }
}

// ─── Order Tracker ───
function showOrderTracker(order) {
  showView("viewTracker");
  const steps = [
    { label: "Placed", icon: "✓", status: "done" },
    { label: "Packing", icon: "📦", status: "current" },
    { label: "On the way", icon: "🛵", status: "" },
    { label: "Delivered", icon: "🏠", status: "" },
  ];

  let items = order.items || [];
  if (typeof items === "string") try { items = JSON.parse(items); } catch { items = []; }

  $("trackerContent").innerHTML = `
    <div class="tracker-check">✅</div>
    <div class="tracker-title">Order placed successfully!</div>
    <div class="tracker-order-no">${esc(order.orderNo || order.order_no || "")}</div>

    <div class="tracker-pipeline">
      ${steps.map(s => `
        <div class="pipe-dot">
          <div class="pipe-circle ${s.status}">${s.icon}</div>
          <div class="pipe-label ${s.status}">${s.label}</div>
        </div>
      `).join("")}
    </div>

    <div class="tracker-eta">Estimated delivery in <strong>8-10 min</strong></div>

    <div class="tracker-items">
      <h4>Items in this order</h4>
      ${items.map(i => `<div class="ti-row"><span>${esc(i.name)} × ${i.qty}</span><span>₹${i.price * i.qty}</span></div>`).join("")}
      <div class="ti-row" style="font-weight:800;margin-top:0.5rem;border-top:1px solid #ddd;padding-top:0.5rem"><span>Total</span><span>₹${order.total}</span></div>
    </div>

    <button class="btn-back-home" onclick="backToHome()">Continue Shopping</button>
  `;
}

function backToHome() {
  fetchProducts().then(() => { renderHome(); showView("viewHome"); });
}

// ─── Helpers ───
function esc(s) { if (!s) return ""; const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

document.addEventListener("DOMContentLoaded", init);
