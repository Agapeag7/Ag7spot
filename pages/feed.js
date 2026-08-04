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

async function loadFeed(maxDistance, productQuery = '') {
    const container = document.getElementById('feedContainer');
    const query = productQuery.trim().toLowerCase();

    try {
        const pos = await getUserPosition(true);
        if (!userPosition) {
            showToast('Localisation non autorisée : affichage par défaut.', 'warning');
        }
        const feed = await getFeed(pos.lat, pos.lng, maxDistance);
        const filtered = feed.filter(p => {
            if (!query) return true;
            const shopName = p.shop_name?.toLowerCase() || '';
            const category = p.category?.toLowerCase() || '';
            return p.name.toLowerCase().includes(query) || shopName.includes(query) || category.includes(query);
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
            const dist = parseFloat(p.distance) || 0;
            const statusHtml = renderShopStatus({ status: p.status });
            const stockHtml = renderStockBadge(p);

            return `
                <div class="product-card" onclick="showProductDetail(${p.id})">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" />
                    <div class="product-info">
                        <div class="shop-name">
                            <i class="fas fa-store"></i> ${p.shop_name || 'Boutique'}
                            <span class="distance-badge"><i class="fas fa-location-dot"></i> ${dist.toFixed(1)} km</span>
                            ${statusHtml}
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
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Impossible de charger le fil d'actualité pour le moment.</p>
            </div>
        `;
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