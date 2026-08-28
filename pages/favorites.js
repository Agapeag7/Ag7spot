// =========================================
// PAGE : FAVORIS / BOUTIQUES SUIVIES
// =========================================
function renderFavorites(container) {
    favoritesState.searchQuery = '';
    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span><i class="fas fa-heart"></i> Mes boutiques suivies</span>
            </div>
            <div class="list-search">
                <input type="search" id="followedShopsSearchInput" placeholder="Rechercher une boutique suivie..." aria-label="Rechercher une boutique suivie" />
            </div>
            <div id="favContainer"></div>
        </div>
    `;

    setupFavoritesScroll();
    loadFavorites(true);
}

const favoritesState = { offset: 0, limit: 10, loading: false, hasMore: true, items: [], searchQuery: '' };

function renderFollowedShops() {
    const container = document.getElementById('favContainer');
    if (!container) return;
    const list = container.querySelector('.follow-list');
    if (!list) return;
    const visibleShops = favoritesState.items.filter(shop => matchesQuery(shop.name, favoritesState.searchQuery));
    list.innerHTML = visibleShops.map(shop => `
        <div class="follow-item">
            <span class="shop-initial" aria-label="${shop.name}">${(shop.name || '?').trim().charAt(0).toUpperCase()}</span>
            <div class="name">${shop.name}</div>
            ${renderShopStatus(shop)}
            <button class="btn-outline btn-sm" onclick="event.stopPropagation(); toggleFollow(${shop.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    if (visibleShops.length === 0) {
        list.innerHTML = '<div class="empty-state small"><i class="fas fa-search"></i><p>Aucune boutique suivie ne correspond à ta recherche.</p></div>';
    }
}

function setupFavoritesScroll() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    if (window._favoritesScrollHandler) mainContent.removeEventListener('scroll', window._favoritesScrollHandler);
    window._favoritesScrollHandler = () => {
        if (favoritesState.loading || !favoritesState.hasMore) return;
        if (mainContent.scrollHeight - mainContent.scrollTop - mainContent.clientHeight < 180) loadFavoritesBatch();
    };
    mainContent.addEventListener('scroll', window._favoritesScrollHandler);
}

async function loadFavorites(reset = false) {
    const container = document.getElementById('favContainer');
    if (!container) return;
    if (reset) {
        favoritesState.offset = 0;
        favoritesState.hasMore = true;
        favoritesState.items = [];
        container.innerHTML = '<div class="loading-state"><p>Chargement de tes boutiques suivies...</p></div>';
    }
    const searchInput = document.getElementById('followedShopsSearchInput');
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', event => {
            favoritesState.searchQuery = event.target.value.trim();
            renderFollowedShops();
        });
    }
    await loadFavoritesBatch(reset);
}

async function loadFavoritesBatch(reset = false) {
    const container = document.getElementById('favContainer');
    if (!container || favoritesState.loading || (!reset && !favoritesState.hasMore)) return;
    favoritesState.loading = true;
    let followed = [];
    try {
        const profile = await getFollowedShops(favoritesState.limit, favoritesState.offset);
        followed = profile.followedShops || [];
        favoritesState.offset += followed.length;
        favoritesState.hasMore = profile.followedHasMore === true;
        followed.forEach(shop => {
            shop.followed = true;
            const localShop = SHOPS.find(item => Number(item.id) === Number(shop.id));
            if (localShop) localShop.followed = true;
            else SHOPS.push(shop);
        });
        favoritesState.items.push(...followed);
    } catch (error) {
        showToast('Impossible de charger les boutiques suivies.', 'error');
        favoritesState.hasMore = false;
    }

    if (reset && followed.length === 0) {
        favoritesState.loading = false;
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <p>Tu ne suis aucune boutique pour le moment.</p>
                <button class="btn-primary" onclick="navigateTo('map')">Découvrir des boutiques</button>
            </div>
        `;
        return;
    }

    if (reset) container.innerHTML = '<div class="follow-list"></div>';
    renderFollowedShops();
    favoritesState.loading = false;
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