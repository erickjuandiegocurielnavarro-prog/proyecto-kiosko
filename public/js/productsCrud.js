// JavaScript dedicado para la Gestión CRUD de Productos del Catálogo (MongoDB)
let productsList = [];
let editingProductId = null;

// Helper para obtener URL de la API de Productos
function getProductApiUrl(id = '') {
  const baseUrl = window.location.port === '5000' 
    ? '' 
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  return id ? `${baseUrl}/api/productos/${id}` : `${baseUrl}/api/productos`;
}

// Cargar productos desde MongoDB/Backend
async function fetchProductsData() {
  const statusText = document.getElementById('prodStatusText');
  try {
    const response = await fetch(getProductApiUrl());
    const result = await response.json();

    if (result.success) {
      productsList = result.data || [];
      if (statusText) {
        statusText.textContent = result.source === 'mongodb' ? 'MongoDB Conectado' : 'Modo Local';
      }
      renderProductsTable();
      if (typeof PRODUCTS !== 'undefined') {
        // Actualizar dataset global del menú interactivo
        PRODUCTS.length = 0;
        productsList.forEach(p => PRODUCTS.push({
          id: p._id,
          name: p.name,
          category: p.category,
          categoryLabel: p.categoryLabel || 'Producto',
          price: p.price,
          image: p.image || 'images/cafe.jpg',
          description: p.description || '',
          badgeClass: p.badgeClass || 'chip-cafe'
        }));
        if (typeof renderProducts === 'function') renderProducts();
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    if (statusText) statusText.textContent = 'Servidor sin respuesta';
  }
}

// Renderizar tabla del CRUD de Productos
function renderProductsTable(itemsToRender = null) {
  const list = itemsToRender || productsList;
  const tbody = document.getElementById('productsTableBody');
  const emptyState = document.getElementById('productsEmptyState');

  const countEl = document.getElementById('statTotalProducts');
  const avgPriceEl = document.getElementById('statAvgProdPrice');

  const count = list.length;
  const sumPrice = list.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const avgPrice = count > 0 ? (sumPrice / count) : 0;

  if (countEl) countEl.textContent = count;
  if (avgPriceEl) avgPriceEl.textContent = `$${avgPrice.toFixed(2)}`;

  if (!tbody) return;

  if (count === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(prod => {
    const idStr = prod._id ? String(prod._id) : 'N/A';
    const shortId = idStr.length > 10 ? idStr.substring(0, 6) + '...' + idStr.substring(idStr.length - 4) : idStr;
    const name = prod.name || 'Sin nombre';
    const category = prod.categoryLabel || prod.category || 'General';
    const priceVal = Number(prod.price) || 0;
    const image = prod.image || 'images/cafe.jpg';

    return `
      <tr>
        <td>
          <span class="mongo-id-chip" title="${idStr}" onclick="copyToClipboard('${idStr}')">
            <i class="fa-solid fa-box"></i> ${shortId}
          </span>
        </td>
        <td>
          <div class="prod-table-cell">
            <img src="${image}" alt="${escapeHtml(name)}" class="table-prod-img">
            <div>
              <strong class="item-name">${escapeHtml(name)}</strong>
              <div class="date-text">${escapeHtml(prod.description || '')}</div>
            </div>
          </div>
        </td>
        <td><span class="category-chip ${prod.badgeClass || 'chip-cafe'}">${escapeHtml(category)}</span></td>
        <td><strong class="item-price">$${priceVal.toFixed(2)}</strong></td>
        <td style="text-align: center;">
          <div class="action-btn-group">
            <button class="table-edit-btn" onclick="openEditProductModal('${idStr}')" title="Editar producto">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="table-del-btn" onclick="deleteProductItem('${idStr}')" title="Eliminar producto">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Guardar/Crear/Editar producto (CREATE & UPDATE)
async function handleProductFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('prodName');
  const catInput = document.getElementById('prodCategory');
  const priceInput = document.getElementById('prodPrice');
  const imageInput = document.getElementById('prodImage');
  const descInput = document.getElementById('prodDesc');
  const submitBtn = document.getElementById('btnSubmitProduct');

  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const category = catInput ? catInput.value : 'cafe';
  const price = parseFloat(priceInput.value);
  const image = imageInput && imageInput.value.trim() ? imageInput.value.trim() : 'images/cafe.jpg';
  const description = descInput ? descInput.value.trim() : '';

  if (!name || isNaN(price)) {
    showToast('Nombre y precio son obligatorios.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
  }

  try {
    const isEdit = Boolean(editingProductId);
    const url = getProductApiUrl(editingProductId || '');
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, price, image, description })
    });

    const result = await response.json();

    if (result.success) {
      showToast(isEdit ? `Producto "${name}" actualizado.` : `Producto "${name}" agregado al catálogo.`);
      resetProductForm();
      await fetchProductsData();
    } else {
      showToast('Error: ' + (result.message || result.error));
    }
  } catch (error) {
    console.error('Error submitting product:', error);
    showToast('Error al conectar con el servidor.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = editingProductId 
        ? '<i class="fa-solid fa-check"></i> Guardar Cambios' 
        : '<i class="fa-solid fa-plus-circle"></i> Agregar a Catálogo';
    }
  }
}

// Abrir formulario para editar producto
function openEditProductModal(id) {
  const prod = productsList.find(p => String(p._id) === String(id));
  if (!prod) return;

  editingProductId = id;

  document.getElementById('prodName').value = prod.name || '';
  document.getElementById('prodCategory').value = prod.category || 'cafe';
  document.getElementById('prodPrice').value = prod.price || '';
  document.getElementById('prodImage').value = prod.image || '';
  document.getElementById('prodDesc').value = prod.description || '';

  const formTitle = document.getElementById('prodFormTitle');
  const submitBtn = document.getElementById('btnSubmitProduct');
  const cancelBtn = document.getElementById('btnCancelProductEdit');

  if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Producto';
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Guardar Cambios';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function resetProductForm() {
  editingProductId = null;
  document.getElementById('prodName').value = '';
  document.getElementById('prodCategory').value = 'cafe';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodImage').value = '';
  document.getElementById('prodDesc').value = '';

  const formTitle = document.getElementById('prodFormTitle');
  const submitBtn = document.getElementById('btnSubmitProduct');
  const cancelBtn = document.getElementById('btnCancelProductEdit');

  if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Agregar Producto al Catálogo';
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Agregar a Catálogo';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

// Eliminar Producto (DELETE)
async function deleteProductItem(id) {
  if (!confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;

  try {
    const response = await fetch(getProductApiUrl(id), {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast('Producto eliminado con éxito de MongoDB.');
      await fetchProductsData();
    } else {
      showToast('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error al eliminar el producto.');
  }
}

// Filtrar tabla de productos
function filterProductsTable() {
  const query = document.getElementById('prodSearchInput')?.value.toLowerCase().trim() || '';
  if (!query) {
    renderProductsTable(productsList);
    return;
  }

  const filtered = productsList.filter(p => {
    const idMatch = String(p._id || '').toLowerCase().includes(query);
    const nameMatch = String(p.name || '').toLowerCase().includes(query);
    const catMatch = String(p.categoryLabel || p.category || '').toLowerCase().includes(query);
    const priceMatch = String(p.price || '').includes(query);
    return idMatch || nameMatch || catMatch || priceMatch;
  });

  renderProductsTable(filtered);
}
