// Products dataset - strictly focusing on the 4 requested categories
const PRODUCTS = [
  {
    id: 1,
    name: "Café Espresso & Cappuccino Gourmet",
    category: "cafe",
    categoryLabel: "Café",
    price: 45.00,
    image: "images/cafe.jpg",
    description: "Preparado con selección especial de granos de café 100% arábica recién molidos. Notas aromáticas a chocolate oscuro, tostado perfecto y una cremosa capa de latte art.",
    badgeClass: "chip-cafe"
  },
  {
    id: 2,
    name: "Frappé Caramel Supreme",
    category: "frappe",
    categoryLabel: "Frappé",
    price: 65.00,
    image: "images/frappe.jpg",
    description: "Refrescante bebida helada a base de espresso doble, leche cremosa, hielo triturado, coronado con una abundante capa de crema batida y un toque dorado de caramelo artesanal.",
    badgeClass: "chip-frappe"
  },
  {
    id: 3,
    name: "Combo Desayuno Gourmet",
    category: "combos",
    categoryLabel: "Combos",
    price: 95.00,
    image: "images/combos.jpg",
    description: "La combinación perfecta para iniciar tu mañana: un café caliente de tu elección, un croissant mantecoso recién horneado y un vaso de jugo de naranja natural.",
    badgeClass: "chip-combos"
  },
  {
    id: 4,
    name: "Selección de Pan Artesanal y Baguettes",
    category: "pan",
    categoryLabel: "Pan en General",
    price: 35.00,
    image: "images/pan.jpg",
    description: "Variedad de pan rústico, sourdough de masa madre fermentado lentamente, baguettes crujientes y piezas de repostería artesanal recién salidos del horno.",
    badgeClass: "chip-pan"
  }
];

// App State
let currentCategory = 'all';
let searchQuery = '';
let cart = [];
let activeProductForModal = null;
let modalQuantity = 1;

// MongoDB State
let mongoItems = [];
let currentMainView = 'menu'; // 'menu' or 'mongo'

// Helper dinámico para resolver la URL de API conectando directamente al servidor de Node.js (Puerto 5000)
function getApiUrl(type = 'list', id = '') {
  // Si no está ejecutándose en el puerto 5000, redirige las peticiones al puerto del servidor Node.js
  const baseUrl = window.location.port === '5000' 
    ? '' 
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  if (type === 'delete') return `${baseUrl}/api/latte/${id}`;
  if (type === 'create') return `${baseUrl}/api/latte`;
  return `${baseUrl}/api/latte`;
}

// DOM Elements
const productGrid = document.getElementById('productGrid');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const themeToggle = document.getElementById('themeToggle');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsList = document.getElementById('cartItemsList');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModal');
const grid3Btn = document.getElementById('grid3Btn');
const listBtn = document.getElementById('listBtn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
  loadCartFromStorage();
  fetchLatteData(); // Cargar datos de MongoDB al iniciar
});

// Switch Main View (Menu vs Tabla MongoDB vs Tabla Pedidos)
function switchMainView(viewName) {
  currentMainView = viewName;
  const heroSec = document.getElementById('heroSection');
  const catalogSec = document.getElementById('catalogSection');
  const mongoSec = document.getElementById('mongoSection');
  const ordersSec = document.getElementById('ordersSection');
  
  const viewMenuBtn = document.getElementById('viewMenuBtn');
  const viewMongoBtn = document.getElementById('viewMongoBtn');
  const viewOrdersBtn = document.getElementById('viewOrdersBtn');
  const menuSearchBox = document.getElementById('menuSearchBox');

  // Ocultar todas las secciones por defecto
  if (heroSec) heroSec.style.display = 'none';
  if (catalogSec) catalogSec.style.display = 'none';
  if (mongoSec) mongoSec.style.display = 'none';
  if (ordersSec) ordersSec.style.display = 'none';
  if (menuSearchBox) menuSearchBox.style.display = 'none';

  if (viewMenuBtn) viewMenuBtn.classList.remove('active');
  if (viewMongoBtn) viewMongoBtn.classList.remove('active');
  if (viewOrdersBtn) viewOrdersBtn.classList.remove('active');

  if (viewName === 'mongo') {
    if (mongoSec) mongoSec.style.display = 'block';
    if (viewMongoBtn) viewMongoBtn.classList.add('active');
    fetchLatteData();
  } else if (viewName === 'orders') {
    if (ordersSec) ordersSec.style.display = 'block';
    if (viewOrdersBtn) viewOrdersBtn.classList.add('active');
    if (typeof fetchOrdersData === 'function') fetchOrdersData();
  } else {
    if (heroSec) heroSec.style.display = 'block';
    if (catalogSec) catalogSec.style.display = 'block';
    if (menuSearchBox) menuSearchBox.style.display = 'flex';
    if (viewMenuBtn) viewMenuBtn.classList.add('active');
  }
}

// ==========================================
// MONGODB DATA & TABLE FUNCTIONS
// ==========================================

async function fetchLatteData() {
  const statusBadge = document.getElementById('mongoStatusBadge');
  const statusText = document.getElementById('statusText');

  try {
    const url = getApiUrl('list');
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      mongoItems = result.data || [];
      if (statusBadge && statusText) {
        statusBadge.className = 'mongo-status-badge status-active';
        statusText.textContent = result.source === 'mongodb' ? 'MongoDB Conectado' : 'Modo Local';
      }
      renderMongoTable();
    } else {
      showToast('Error al cargar datos de MongoDB: ' + (result.error || result.message));
    }
  } catch (error) {
    console.error('Error fetching MongoDB data:', error);
    if (statusBadge && statusText) {
      statusBadge.className = 'mongo-status-badge status-offline';
      statusText.textContent = 'Servidor sin respuesta';
    }
  }
}

function renderMongoTable(itemsToRender = null) {
  const list = itemsToRender || mongoItems;
  const tbody = document.getElementById('mongoTableBody');
  const emptyStateTable = document.getElementById('mongoEmptyState');

  // Actualizar contadores
  const totalCountEl = document.getElementById('statTotalCount');
  const avgPriceEl = document.getElementById('statAvgPrice');
  const totalPriceEl = document.getElementById('statTotalPrice');

  const count = list.length;
  const sumPrice = list.reduce((sum, item) => sum + (Number(item.precio) || 0), 0);
  const avgPrice = count > 0 ? (sumPrice / count) : 0;

  if (totalCountEl) totalCountEl.textContent = count;
  if (avgPriceEl) avgPriceEl.textContent = `$${avgPrice.toFixed(2)}`;
  if (totalPriceEl) totalPriceEl.textContent = `$${sumPrice.toFixed(2)}`;

  if (!tbody) return;

  if (count === 0) {
    tbody.innerHTML = '';
    if (emptyStateTable) emptyStateTable.style.display = 'block';
    return;
  }

  if (emptyStateTable) emptyStateTable.style.display = 'none';

  tbody.innerHTML = list.map(item => {
    const idStr = item._id ? String(item._id) : 'N/A';
    const shortId = idStr.length > 12 ? idStr.substring(0, 8) + '...' + idStr.substring(idStr.length - 4) : idStr;
    const nameStr = item.name || 'Sin nombre';
    const priceVal = Number(item.precio) || 0;
    const userStr = item.user || '@anonimo';
    const dateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Reciente';

    return `
      <tr>
        <td>
          <span class="mongo-id-chip" title="${idStr}" onclick="copyToClipboard('${idStr}')">
            <i class="fa-solid fa-hashtag"></i> ${shortId}
            <i class="fa-regular fa-copy copy-icon"></i>
          </span>
        </td>
        <td><strong class="item-name">${escapeHtml(nameStr)}</strong></td>
        <td><span class="item-price">$${priceVal.toFixed(2)}</span></td>
        <td><span class="user-chip"><i class="fa-solid fa-user-circle"></i> ${escapeHtml(userStr)}</span></td>
        <td><span class="date-text">${dateFormatted}</span></td>
        <td style="text-align: center;">
          <button class="table-del-btn" onclick="deleteMongoItem('${idStr}')" title="Eliminar registro">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Guardar automáticamente los pedidos del menú en MongoDB
async function saveOrderToMongo(name, precio, user = '@cliente') {
  try {
    const url = getApiUrl('create');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, precio, user })
    });
    const result = await response.json();
    if (result.success) {
      await fetchLatteData(); // Actualiza la tabla de MongoDB al instante
    }
  } catch (error) {
    console.error('Error al guardar pedido en MongoDB:', error);
  }
}

async function handleMongoSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('inputName');
  const priceInput = document.getElementById('inputPrice');
  const userInput = document.getElementById('inputUser');
  const submitBtn = document.getElementById('btnSubmitMongo');

  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const precio = parseFloat(priceInput.value);
  const user = userInput ? userInput.value.trim() : '@anonimo';

  if (!name || isNaN(precio)) {
    showToast('Por favor completa los campos requeridos.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
  }

  try {
    const url = getApiUrl('create');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, precio, user })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`Registro "${name}" insertado con éxito.`);
      nameInput.value = '';
      priceInput.value = '';
      if (userInput) userInput.value = '@anonimo';
      await fetchLatteData();
    } else {
      showToast('Error: ' + (result.message || result.error));
    }
  } catch (error) {
    console.error('Error inserting data:', error);
    showToast('Error al conectar con el servidor.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Insertar en MongoDB';
    }
  }
}

async function deleteMongoItem(id) {
  if (!confirm('¿Estás seguro de eliminar este registro de la base de datos?')) return;

  try {
    const url = getApiUrl('delete', id);
    const response = await fetch(url, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast('Registro eliminado con éxito.');
      await fetchLatteData();
    } else {
      showToast('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Error al eliminar registro.');
  }
}

function filterMongoTable() {
  const query = document.getElementById('mongoSearchInput')?.value.toLowerCase().trim() || '';
  if (!query) {
    renderMongoTable(mongoItems);
    return;
  }

  const filtered = mongoItems.filter(item => {
    const idMatch = String(item._id || '').toLowerCase().includes(query);
    const nameMatch = String(item.name || '').toLowerCase().includes(query);
    const userMatch = String(item.user || '').toLowerCase().includes(query);
    const priceMatch = String(item.precio || '').includes(query);
    return idMatch || nameMatch || userMatch || priceMatch;
  });

  renderMongoTable(filtered);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('ID copiado al portapapeles');
  }).catch(() => {
    showToast('ID: ' + text);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// CATALOG & CART FUNCTIONS
// ==========================================

function renderProducts() {
  const filtered = PRODUCTS.filter(product => {
    const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!productGrid || !emptyState) return;

  if (filtered.length === 0) {
    productGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  productGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  productGrid.innerHTML = filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="card-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="card-img" loading="lazy">
        <span class="category-chip ${product.badgeClass}">${product.categoryLabel}</span>
        <button class="quick-view-btn" onclick="openModal(${product.id})" title="Ver detalles">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-desc">${product.description}</p>
        <div class="card-footer">
          <span class="price-tag">$${product.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${product.id})">
            <i class="fa-solid fa-plus"></i> Agregar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  filterBtns.forEach(btn => {
    if (btn.dataset.category === cat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderProducts();
}

function resetFilters() {
  currentCategory = 'all';
  searchQuery = '';
  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.style.display = 'none';
  filterCategory('all');
}

function openModal(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  activeProductForModal = product;
  modalQuantity = 1;

  document.getElementById('modalImg').src = product.image;
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('modalDescription').textContent = product.description;
  
  const tag = document.getElementById('modalCategoryTag');
  tag.textContent = product.categoryLabel;
  tag.className = `category-chip ${product.badgeClass}`;

  document.getElementById('qtyVal').textContent = modalQuantity;
  productModal.style.display = 'flex';
}

function closeModal() {
  productModal.style.display = 'none';
}

async function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }

  saveCartAndSync();

  // Guardar automáticamente en MongoDB al agregar del menú
  await saveOrderToMongo(product.name, product.price * qty, '@cliente');

  showToast(`"${product.name}" agregado al pedido y registrado en MongoDB.`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartAndSync();
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCartAndSync();
    }
  }
}

function saveCartAndSync() {
  localStorage.setItem('aroma_cart', JSON.stringify(cart));
  updateCartUI();
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('aroma_cart');
  if (saved) {
    try { cart = JSON.parse(saved); } catch(e) { cart = []; }
  }
  updateCartUI();
}

function updateCartUI() {
  if (!cartBadge || !cartItemsList || !cartSubtotal || !cartTotal) return;

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
        <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>Tu pedido está vacío.</p>
      </div>
    `;
    cartSubtotal.textContent = '$0.00';
    cartTotal.textContent = '$0.00';
    return;
  }

  let subtotal = 0;
  cartItemsList.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
        </div>
        <div class="quantity-selector" style="transform: scale(0.85);">
          <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

async function checkout() {
  if (cart.length === 0) return;
  
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsSummaryStr = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

  // Guardar en colección de Pedidos (CRUD)
  try {
    const baseUrl = window.location.port === '5000' ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;
    await fetch(`${baseUrl}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: '@cliente_kiosko',
        itemsSummary: itemsSummaryStr,
        total: totalAmount,
        status: 'Pendiente'
      })
    });
  } catch(e) {
    console.error('Error guardando pedido:', e);
  }

  alert(`¡Gracias por tu pedido! Total: $${totalAmount.toFixed(2)}\nTu orden ha sido registrada en la tabla de Pedidos de MongoDB.`);
  cart = [];
  saveCartAndSync();
  if (cartDrawer) cartDrawer.classList.remove('active');
  if (typeof fetchOrdersData === 'function') fetchOrdersData();
  await fetchLatteData();
}

function showToast(message) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function setupEventListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterCategory(btn.dataset.category);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderProducts();
    });
  }

  if (grid3Btn && listBtn) {
    grid3Btn.addEventListener('click', () => {
      grid3Btn.classList.add('active');
      listBtn.classList.remove('active');
      productGrid.classList.remove('list-view');
    });

    listBtn.addEventListener('click', () => {
      listBtn.classList.add('active');
      grid3Btn.classList.remove('active');
      productGrid.classList.add('list-view');
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      const newTheme = current === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      themeToggle.querySelector('i').className = newTheme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  }

  if (cartBtn && closeCartBtn && cartDrawer) {
    cartBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
    closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));
    cartDrawer.addEventListener('click', (e) => {
      if (e.target === cartDrawer) cartDrawer.classList.remove('active');
    });
  }

  if (closeModalBtn && productModal) {
    closeModalBtn.addEventListener('click', closeModal);
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeModal();
    });
  }

  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (modalQuantity > 1) {
      modalQuantity--;
      document.getElementById('qtyVal').textContent = modalQuantity;
    }
  });

  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    modalQuantity++;
    document.getElementById('qtyVal').textContent = modalQuantity;
  });

  document.getElementById('modalAddCartBtn')?.addEventListener('click', () => {
    if (activeProductForModal) {
      addToCart(activeProductForModal.id, modalQuantity);
      closeModal();
    }
  });
}