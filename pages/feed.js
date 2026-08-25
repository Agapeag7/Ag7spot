// =========================================
// PAGE : FIL D'ACTUALITÉ
// =========================================
// Petit utilitaire debounce pour limiter les appels lors de la saisie
function debounce(fn, wait = 300) {
    let t = null;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// État de pagination du fil
const feedState = {
    allItems: [],
    displayedCount: 0,
    pageSize: 5,
    loading: false,
    end: false,
    currentQuery: '',
    currentDist: 5
};
function renderFeed(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span>Fil d'actualité</span>
                <a href="#" data-nav="map">Voir la carte</a>
            </div>
            <div class="feed-search" style="margin-bottom:12px; margin-top:12px;">
                <input type="search" id="feedSearchInput" placeholder="Rechercher produits ou boutiques..." />
            </div>
            ${renderDistanceFilter()}
            <div id="feedSpinner" class="feed-spinner hidden"><div class="spinner"></div></div>
            <div id="feedContainer"></div>
            <div id="feedBatchSpinner" class="feed-batch-spinner hidden"><div class="spinner small"></div></div>
        </div>
    `;

    // Écouteur sur le slider
    const slider = document.getElementById('distanceRange');
    if (slider) {
        slider.addEventListener('input', function() {
            document.getElementById('distanceValue').textContent = `${this.value} km`;
            loadFeed(parseInt(this.value));
        });
    }

    // Recherche en live (debounced)
    const searchInput = document.getElementById('feedSearchInput');
    const debouncedSearch = debounce((q) => {
        const dist = parseInt(document.getElementById('distanceRange')?.value || 5);
        loadFeed(dist, q || '');
    }, 300);
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value.trim());
        });
    }

    // Setup scroll listener on mainContent to append batches
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        // remove previous handler if any
        if (window._feedScrollHandler) mainContent.removeEventListener('scroll', window._feedScrollHandler);
        window._feedScrollHandler = function() {
            try {
                if (feedState.loading || feedState.end) return;
                const bottomDistance = mainContent.scrollHeight - mainContent.scrollTop - mainContent.clientHeight;
                if (bottomDistance < 240) {
                    renderFeedBatch();
                }
            } catch (e) {}
        };
        mainContent.addEventListener('scroll', window._feedScrollHandler);
    }

    loadFeed(5);
}

function renderDistanceFilter() {
    return `
        <div class="distance-filter">
            <i class="fas fa-location-dot"></i>
            <input type="range" min="1" max="20" value="5" id="distanceRange" />
            <span id="distanceValue">5 km</span>
        </div>
    `;
}

async function loadFeed(maxDistance, productQuery = '') {
    const container = document.getElementById('feedContainer');
    const query = (productQuery || '').trim();

    // reset state on new load
    feedState.loading = true;
    feedState.currentQuery = query;
    feedState.currentDist = maxDistance;
    feedState.displayedCount = 0;
    feedState.end = false;
    feedState.allItems = [];
    // show initial spinner
    try { document.getElementById('feedSpinner')?.classList.remove('hidden'); } catch(e){}

    try {
        const pos = await getUserPosition(true);
        if (!userPosition) {
            showToast('Localisation non autorisée : affichage par défaut.', 'warning');
        }
        const feed = await getFeed(pos.lat, pos.lng, maxDistance);

        // Appliquer les préférences utilisateur si présentes
        let categories = [];
        try {
            const userId = (window.CURRENT_USER && window.CURRENT_USER.id) || null;
            const stored = userId ? localStorage.getItem(`user_categories_${userId}`) : localStorage.getItem('user_categories');
            if (stored) categories = JSON.parse(stored) || [];
        } catch (e) { categories = []; }

        const filtered = (feed || []).filter(p => {
            if (categories.length > 0 && p.category && !categories.includes(p.category)) return false;
            if (!query) return true;
            const combined = `${p.name || ''} ${p.shop_name || ''} ${p.category || ''} ${p.description || ''}`;
            return matchesQuery(combined, query);
        });

        if (!filtered || filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store-slash"></i>
                    <p>Aucun produit trouvé dans un rayon de ${maxDistance} km.</p>
                    <button class="btn-primary btn-sm" onclick="loadFeed(10)">Élargir à 10 km</button>
                </div>
            `;
            feedState.loading = false;
            feedState.end = true;
            return;
        }

        feedState.allItems = filtered;
        // render first batch
        container.innerHTML = '';
        // hide initial spinner before rendering
        try { document.getElementById('feedSpinner')?.classList.add('hidden'); } catch(e){}
        renderFeedBatch();
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Impossible de charger le fil d'actualité pour le moment.</p>
            </div>
        `;
        feedState.loading = false;
    }
}

function renderFeedBatch() {
    const container = document.getElementById('feedContainer');
    if (!container) return;
    if (feedState.loading && feedState.displayedCount > 0) return;
    feedState.loading = true;
    // show batch spinner
    try { document.getElementById('feedBatchSpinner')?.classList.remove('hidden'); } catch(e){}

    const start = feedState.displayedCount;
    const end = Math.min(start + feedState.pageSize, feedState.allItems.length);
    const slice = feedState.allItems.slice(start, end);

    const html = slice.map(p => {
        const dist = parseFloat(p.distance) || 0;
        const shopStatus = p.shop_status || p.status || 'closed';
        const statusHtml = renderShopStatus({ status: shopStatus });
        const stockHtml = renderStockBadge(p);
        const isShopOwner = Number(p.shop_owner_id) === Number(CURRENT_USER?.id);
        const followLabel = Number(p.followed) === 1 || p.followed === true ? 'Suivi(e)' : 'Suivre';
        const followButton = isShopOwner ? '' : `
                        <button class="btn-outline btn-sm follow-shop-button" onclick="event.stopPropagation(); toggleFeedFollow(${Number(p.shop_id)}, ${followLabel === 'Suivi(e)'}, this)">
                            <i class="fas fa-heart"></i> ${followLabel}
                        </button>`;
        return `
            <div class="product-card" onclick="showProductDetail(${p.id})">
                <img src="${getProductImage(p)}" alt="${p.name}" loading="lazy" />
                <div class="product-info">
                    <div class="shop-name">
                        <i class="fas fa-store"></i> ${p.shop_name || 'Boutique'}
                        <span class="distance-badge"><i class="fas fa-location-dot"></i> ${dist.toFixed(1)} km</span>
                        ${statusHtml}
                        ${followButton}
                    </div>
                    <h3>${p.name}</h3>
                    <div class="meta">
                        <span class="price">${parseFloat(p.price).toFixed(2)} $</span>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            ${stockHtml}
                            <button class="btn-outline btn-sm" onclick="event.stopPropagation(); openChat(${p.id})">
                                <i class="fas fa-comment"></i> Réserver
                            </button>
                            <button class="btn-outline btn-sm" onclick="event.stopPropagation(); getDirections(${p.lat}, ${p.lng})">
                                <img src="ico/spot.png" alt="Ag7Spot" class="btn-icon-app" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // append
    container.insertAdjacentHTML('beforeend', html);
    feedState.displayedCount = end;
    feedState.loading = false;
    // hide batch spinner
    try { document.getElementById('feedBatchSpinner')?.classList.add('hidden'); } catch(e){}

    if (feedState.displayedCount >= feedState.allItems.length) {
        feedState.end = true;
        // optional: show a small end marker
        container.insertAdjacentHTML('beforeend', `<div class="end-of-feed" style="text-align:center;color:#6B7280;padding:12px 0;">Vous avez atteint la fin</div>`);
    }
}

function showProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const shop = SHOPS.find(s => s.id === product.shopId);
    alert(`🛍️ ${product.name}\n📍 ${shop.name}\n💰 ${product.price} $\n Stock: ${product.stock} unités`);
}

function getDirections(lat, lng) {
    getUserPosition().then(pos => {
        const url = `https://www.google.com/maps/dir/${pos.lat},${pos.lng}/${lat},${lng}`;
        window.open(url, '_blank');
    });
}