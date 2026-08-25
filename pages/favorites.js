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

async function loadFavorites() {
    const container = document.getElementById('favContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><p>Chargement de tes boutiques suivies...</p></div>';

    let followed = SHOPS.filter(s => s.followed);
    try {
        const profile = await getProfile();
        followed = profile.followedShops || [];
        followed.forEach(shop => {
            shop.followed = true;
            const localShop = SHOPS.find(item => Number(item.id) === Number(shop.id));
            if (localShop) localShop.followed = true;
            else SHOPS.push(shop);
        });
    } catch (error) {
        showToast('Impossible de charger les boutiques suivies.', 'error');
    }

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
        <div class="follow-item">
            <img src="${shop.avatar}" alt="${shop.name}" />
            <div class="name">${shop.name}</div>
            ${renderShopStatus(shop)}
            <button class="btn-outline btn-sm" onclick="event.stopPropagation(); toggleFollow(${shop.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('') + `</div>`;
}

async function toggleFollow(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;

    const wasFollowed = !!shop.followed;
    try {
        const response = wasFollowed ? await unfollowShop(shopId) : await followShop(shopId);
        if (!response.success) {
            throw new Error('Le suivi de la boutique a échoué.');
        }
        shop.followed = !wasFollowed;
        loadFavorites();
        showToast(shop.followed ? 'Boutique suivie' : 'Boutique retirée', 'info');
    } catch (error) {
        showToast(error.message || 'Impossible de modifier le suivi.', 'error');
    }
}