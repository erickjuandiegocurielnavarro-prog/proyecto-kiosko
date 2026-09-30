(() => {
    const modal = document.querySelector('#buyModal');
    if (!modal) return;

    const ticketsContainer = document.querySelector('#ticketsContainer');
    const modalTitle = document.querySelector('#modalRaffleName');
    const selectedSummary = document.querySelector('#selectedSummary');
    const totalSummary = document.querySelector('#totalSummary');
    const messageBox = document.querySelector('#modalMessage');
    const closeBtn = document.querySelector('#closeModalBtn');
    const confirmBtn = document.querySelector('#confirmPurchaseBtn');
    const openButtons = document.querySelectorAll('.open-modal-btn');

    let currentRaffleId = null;
    let currentPrice = 0;
    const selectedTickets = new Set();

    function refreshSummary() {
        selectedSummary.textContent = `Seleccionados: ${selectedTickets.size}`;
        totalSummary.textContent = `Total: $${(selectedTickets.size * currentPrice).toFixed(2)}`;
    }

    function openModal() {
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        ticketsContainer.innerHTML = '';
        selectedTickets.clear();
        refreshSummary();
        messageBox.textContent = '';
    }

    async function loadTickets(raffleId) {
        const response = await fetch(`${window.APP_BASE_URL}/api/raffles/${raffleId}/tickets`);
        const data = await response.json();
        if (!data.ok) throw new Error('No fue posible cargar boletos');

        ticketsContainer.innerHTML = '';
        data.tickets.forEach((ticket) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ticket-btn ${ticket.estado === 'vendido' ? 'sold' : ''}`;
            btn.textContent = ticket.numero;
            btn.disabled = ticket.estado === 'vendido';
            btn.dataset.number = String(ticket.numero);

            btn.addEventListener('click', () => {
                if (btn.classList.contains('sold')) return;
                const number = Number(btn.dataset.number);
                if (selectedTickets.has(number)) {
                    selectedTickets.delete(number);
                    btn.classList.remove('selected');
                } else {
                    selectedTickets.add(number);
                    btn.classList.add('selected');
                }
                refreshSummary();
            });

            ticketsContainer.appendChild(btn);
        });
    }

    openButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            currentRaffleId = Number(button.dataset.raffleId);
            currentPrice = Number(button.dataset.price);
            modalTitle.textContent = `Compra de boletos - ${button.dataset.raffleName}`;
            refreshSummary();
            openModal();
            try {
                await loadTickets(currentRaffleId);
            } catch (error) {
                messageBox.textContent = error.message;
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
        if (selectedTickets.size === 0) {
            messageBox.textContent = 'Selecciona al menos un boleto.';
            return;
        }

        confirmBtn.disabled = true;
        messageBox.textContent = 'Procesando compra...';

        try {
            const response = await fetch(`${window.APP_BASE_URL}/api/tickets/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    raffle_id: currentRaffleId,
                    numbers: [...selectedTickets],
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.ok) {
                messageBox.textContent = data.message || 'Error al procesar la compra.';
                confirmBtn.disabled = false;
                return;
            }

            messageBox.textContent = `${data.message}. Total pagado: $${Number(data.total).toFixed(2)}`;
            await loadTickets(currentRaffleId);
            selectedTickets.clear();
            refreshSummary();
        } catch (error) {
            messageBox.textContent = 'No se pudo completar la compra.';
        } finally {
            confirmBtn.disabled = false;
        }
    });
})();
