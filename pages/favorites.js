// =========================================
// PAGE : FAVORIS / BOUTIQUES SUIVIES
// =========================================
function renderFavorites(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span><i class="fas fa-heart"></i> Mes boutiques suivies</span>
            </div>
            <div id="favContainer"></div>
        </div>
    `;

    loadFavorites();
}

function loadFavorites() {
    const container = document.getElementById('favContainer');
    const followed = SHOPS.filter(s => s.followed);

    if (followed.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <p>Tu ne suis aucune boutique pour le moment.</p>
                <button class="btn-primary" onclick="navigateTo('map')">Découvrir des boutiques</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `<div class="follow-list">` + followed.map(shop => `
        <div class="follow-item" onclick="showShopDetail(${shop.id})">
            <img src="${shop.avatar}" alt="${shop.name}" />
            <div class="name">${shop.name}</div>
            ${renderShopStatus(shop)}
            <button class="btn-outline btn-sm" onclick="event.stopPropagation(); toggleFollow(${shop.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('') + `</div>`;
}

function toggleFollow(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;
    shop.followed = !shop.followed;
    loadFavorites();
    showToast(shop.followed ? 'Boutique suivie' : 'Boutique retirée', 'info');
}

function showShopDetail(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;
    const products = PRODUCTS.filter(p => p.shopId === shopId);
    let msg = `🏪 ${shop.name}\n📍 ${shop.address}\n${renderShopStatus(shop)}\n\n Produits:\n`;
    products.forEach(p => {
        msg += `- ${p.name} : ${p.price.toFixed(2)} $ (${p.stock} en stock)\n`;
    });
    alert(msg);
}