// JavaScript dedicado para la Gestión CRUD de Pedidos (MongoDB)
let ordersList = [];

// Helper para obtener URL dinámica de la API de Pedidos
function getOrderApiUrl(id = '') {
  const baseUrl = window.location.port === '5000' 
    ? '' 
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  return id ? `${baseUrl}/api/pedidos/${id}` : `${baseUrl}/api/pedidos`;
}

// Cargar pedidos al iniciar la vista
async function fetchOrdersData() {
  const statusText = document.getElementById('orderStatusText');
  try {
    const response = await fetch(getOrderApiUrl());
    const result = await response.json();

    if (result.success) {
      ordersList = result.data || [];
      if (statusText) {
        statusText.textContent = result.source === 'mongodb' ? 'MongoDB Conectado' : 'Modo Local';
      }
      renderOrdersTable();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (statusText) statusText.textContent = 'Servidor sin respuesta';
  }
}

// Renderizar la tabla de Pedidos
function renderOrdersTable(itemsToRender = null) {
  const list = itemsToRender || ordersList;
  const tbody = document.getElementById('ordersTableBody');
  const emptyState = document.getElementById('ordersEmptyState');

  // Contadores y estadísticas
  const totalCountEl = document.getElementById('statTotalOrders');
  const totalIncomeEl = document.getElementById('statTotalIncome');
  const pendingCountEl = document.getElementById('statPendingOrders');

  const count = list.length;
  const totalIncome = list.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const pendingCount = list.filter(item => item.status === 'Pendiente' || item.status === 'En Preparación').length;

  if (totalCountEl) totalCountEl.textContent = count;
  if (totalIncomeEl) totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
  if (pendingCountEl) pendingCountEl.textContent = pendingCount;

  if (!tbody) return;

  if (count === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(order => {
    const idStr = order._id ? String(order._id) : 'N/A';
    const shortId = idStr.length > 10 ? idStr.substring(0, 6) + '...' + idStr.substring(idStr.length - 4) : idStr;
    const customer = order.customerName || '@cliente';
    const summary = order.itemsSummary || 'Sin detalle';
    const totalVal = Number(order.total) || 0;
    const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleString('es-MX', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Reciente';

    // Determinar la clase del badge según el estado
    let badgeClass = 'badge-pending';
    if (order.status === 'En Preparación') badgeClass = 'badge-prep';
    if (order.status === 'Completado') badgeClass = 'badge-completed';
    if (order.status === 'Cancelado') badgeClass = 'badge-canceled';

    return `
      <tr>
        <td>
          <span class="mongo-id-chip" title="${idStr}" onclick="copyToClipboard('${idStr}')">
            <i class="fa-solid fa-receipt"></i> ${shortId}
          </span>
        </td>
        <td><strong class="item-name">${escapeHtml(customer)}</strong></td>
        <td><span class="order-summary-text">${escapeHtml(summary)}</span></td>
        <td><strong class="item-price">$${totalVal.toFixed(2)}</strong></td>
        <td>
          <select class="status-select ${badgeClass}" onchange="updateOrderStatus('${idStr}', this.value)">
            <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
            <option value="En Preparación" ${order.status === 'En Preparación' ? 'selected' : ''}>👨‍🍳 En Preparación</option>
            <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>✅ Completado</option>
            <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
          </select>
        </td>
        <td><span class="date-text">${dateFormatted}</span></td>
        <td style="text-align: center;">
          <button class="table-del-btn" onclick="deleteOrder('${idStr}')" title="Eliminar pedido">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Crear un nuevo pedido desde el formulario manual
async function handleCreateOrderSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('orderCustomer');
  const summaryInput = document.getElementById('orderSummary');
  const totalInput = document.getElementById('orderTotal');
  const statusInput = document.getElementById('orderStatusSelect');
  const submitBtn = document.getElementById('btnSubmitOrder');

  if (!summaryInput || !totalInput) return;

  const customerName = nameInput ? nameInput.value.trim() : '@cliente';
  const itemsSummary = summaryInput.value.trim();
  const total = parseFloat(totalInput.value);
  const status = statusInput ? statusInput.value : 'Pendiente';

  if (!itemsSummary || isNaN(total)) {
    showToast('Por favor completa la descripción del pedido y el total.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
  }

  try {
    const response = await fetch(getOrderApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, itemsSummary, total, status })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`Pedido de $${total.toFixed(2)} registrado con éxito.`);
      if (nameInput) nameInput.value = '@cliente';
      summaryInput.value = '';
      totalInput.value = '';
      await fetchOrdersData();
    } else {
      showToast('Error: ' + (result.message || result.error));
    }
  } catch (error) {
    console.error('Error creating order:', error);
    showToast('Error al conectar con el servidor.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Agregar Pedido a MongoDB';
    }
  }
}

// Actualizar estado del pedido (UPDATE)
async function updateOrderStatus(id, newStatus) {
  try {
    const response = await fetch(getOrderApiUrl(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (result.success) {
      showToast(`Estado del pedido actualizado a "${newStatus}".`);
      await fetchOrdersData();
    } else {
      showToast('Error al actualizar: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating order:', error);
    showToast('Error de conexión al actualizar pedido.');
  }
}

// Eliminar pedido (DELETE)
async function deleteOrder(id) {
  if (!confirm('¿Estás seguro de eliminar este pedido de la base de datos?')) return;

  try {
    const response = await fetch(getOrderApiUrl(id), {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast('Pedido eliminado con éxito de MongoDB.');
      await fetchOrdersData();
    } else {
      showToast('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    showToast('Error al eliminar pedido.');
  }
}

// Filtrar tabla de pedidos
function filterOrdersTable() {
  const query = document.getElementById('orderSearchInput')?.value.toLowerCase().trim() || '';
  if (!query) {
    renderOrdersTable(ordersList);
    return;
  }

  const filtered = ordersList.filter(order => {
    const idMatch = String(order._id || '').toLowerCase().includes(query);
    const customerMatch = String(order.customerName || '').toLowerCase().includes(query);
    const summaryMatch = String(order.itemsSummary || '').toLowerCase().includes(query);
    const statusMatch = String(order.status || '').toLowerCase().includes(query);
    const totalMatch = String(order.total || '').includes(query);
    return idMatch || customerMatch || summaryMatch || statusMatch || totalMatch;
  });

  renderOrdersTable(filtered);
}
