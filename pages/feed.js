// =========================================
// PAGE : FIL D'ACTUALITÉ
// =========================================
function renderFeed(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span>Fil d'actualité</span>
                <a href="#" data-nav="map">Voir la carte</a>
            </div>
            ${renderDistanceFilter()}
            <div id="feedContainer"></div>
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

function loadFeed(maxDistance, productQuery = '') {
    const container = document.getElementById('feedContainer');
    const query = productQuery.trim().toLowerCase();

    // Simulation d'appel API
    getUserPosition().then(pos => {
        // Filtrer les produits par distance et par nom
        const filtered = PRODUCTS.filter(p => {
            const shop = SHOPS.find(s => s.id === p.shopId);
            if (!shop) return false;
            const dist = getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
            if (dist > maxDistance) return false;
            if (!query) return true;
            return p.name.toLowerCase().includes(query) || shop.name.toLowerCase().includes(query) || shop.category.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store-slash"></i>
                    <p>Aucun produit trouvé dans un rayon de ${maxDistance} km.</p>
                    <button class="btn-primary btn-sm" onclick="loadFeed(10)">Élargir à 10 km</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(p => {
            const shop = SHOPS.find(s => s.id === p.shopId);
            const dist = getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
            const statusHtml = renderShopStatus(shop);
            const stockHtml = renderStockBadge(p);

            return `
                <div class="product-card" onclick="showProductDetail(${p.id})">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" />
                    <div class="product-info">
                        <div class="shop-name">
                            <i class="fas fa-store"></i> ${shop.name}
                            <span class="distance-badge"><i class="fas fa-location-dot"></i> ${dist.toFixed(1)} km</span>
                            ${statusHtml}
                        </div>
                        <h3>${p.name}</h3>
                        <div class="meta">
                            <span class="price">${p.price.toFixed(2)} $</span>
                            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                ${stockHtml}
                                <button class="btn-outline btn-sm" onclick="event.stopPropagation(); openChat(${p.id})">
                                    <i class="fas fa-comment"></i> Réserver
                                </button>
                                <button class="btn-outline btn-sm" onclick="event.stopPropagation(); getDirections(${shop.lat}, ${shop.lng})">
                                    <i class="fas fa-map-pin"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    });
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