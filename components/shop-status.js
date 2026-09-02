// =========================================
// COMPOSANT : STATUT COMMERCANT
// =========================================
function renderShopStatus(shop) {
    const statusMap = {
        'open': { icon: 'fa-store', label: 'Ouvert', cls: 'open' },
        'closed': { icon: 'fa-store-slash', label: 'Fermé', cls: 'closed' },
        'break': { icon: 'fa-mug-hot', label: 'Pause', cls: 'break' }
    };
    const status = String(shop?.status || 'closed').toLowerCase();
    const s = statusMap[status] || statusMap['closed'];
    return `<span class="shop-status ${s.cls}"><i class="fas ${s.icon}"></i> ${s.label}</span>`;
}

// Mise à jour du statut (commerçant)
async function updateShopStatus(shopId, status) {
    try {
        const result = await apiCall('shops.php', 'PUT', { shop_id: shopId, status });
        const shop = SHOPS.find(s => s.id === shopId);
        if (shop) {
            shop.status = status;
            if (typeof refreshShopStatusInMap === 'function') {
                refreshShopStatusInMap(shop);
            }
            showToast(`Statut mis à jour : ${status}`, 'success');
        }
        return result;
    } catch (e) {
        showToast('Erreur mise à jour statut', 'error');
    }
}