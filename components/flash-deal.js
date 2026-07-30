// =========================================
// COMPOSANT : FLASH DEALS
// =========================================
function renderFlashDeals(deals) {
    if (!deals || deals.length === 0) return '';

    return deals.map(deal => {
        const product = PRODUCTS.find(p => p.id === deal.productId);
        const shop = SHOPS.find(s => s.id === deal.shopId);
        const timeLeft = getTimeLeft(deal.endTime);

        return `
            <div class="flash-deal-card" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;padding:12px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">
                <i class="fas fa-bolt" style="color:#d97706;font-size:20px;"></i>
                <div style="flex:1;">
                    <span style="font-weight:600;">${product ? product.name : 'Produit'}</span>
                    <span style="background:#d97706;color:white;padding:2px 10px;border-radius:30px;font-size:12px;font-weight:700;margin-left:8px;">-${deal.discount}%</span>
                    <br>
                    <span style="font-size:12px;color:#92400e;">${shop ? shop.name : ''} · Fin dans ${timeLeft}</span>
                </div>
                <button class="btn-primary btn-sm" onclick="getDirectionsStatic(${shop ? shop.lat : 0}, ${shop ? shop.lng : 0})">
                    <i class="fas fa-map-pin"></i>
                </button>
            </div>
        `;
    }).join('');
}

function getTimeLeft(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = Math.max(0, Math.floor((end - now) / 60000));
    if (diff > 60) return `${Math.floor(diff/60)}h${diff%60}min`;
    return `${diff} min`;
}

// Récupération des deals à proximité
async function loadNearbyDeals() {
    try {
        const pos = await getUserPosition();
        const deals = await getFlashDeals(pos.lat, pos.lng, 2);
        // Afficher dans le fil ou la carte
        return deals;
    } catch (e) {
        return FLASH_DEALS; // fallback mock
    }
}