// =========================================
// PAGE : CARTE
// =========================================
function renderMap(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="map-controls">
                <input type="text" placeholder="Rechercher une boutique..." id="searchMap" />
                <button class="btn-outline" id="locateBtn"><i class="fas fa-location-arrow"></i></button>
            </div>
            <div id="map"></div>
            <p class="map-hint"><i class="fas fa-info-circle"></i> Clique sur une boutique pour voir ses produits.</p>
        </div>
    `;

    // Initialiser la carte après un court délai
    setTimeout(() => initMap(), 300);
}

let mapInstance = null;
let mapMarkers = [];
let routeLayer = null;

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    getUserPosition().then(pos => {
        if (mapInstance) {
            mapInstance.invalidateSize();
            return;
        }

        mapInstance = L.map('map').setView([pos.lat, pos.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(mapInstance);

        // Marqueur utilisateur
        L.marker([pos.lat, pos.lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<i class="fas fa-circle" style="color:#6C3BFF;font-size:18px;"></i>',
                iconSize: [18, 18]
            })
        }).addTo(mapInstance).bindPopup('Vous êtes ici');

        // Charger les boutiques
        loadShopsOnMap(pos);

        // Bouton localisation
        document.getElementById('locateBtn')?.addEventListener('click', () => {
            getUserPosition().then(newPos => {
                mapInstance.setView([newPos.lat, newPos.lng], 15);
                showToast('Position mise à jour', 'info');
            });
        });

        // Recherche
        document.getElementById('searchMap')?.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterMarkers(query);
        });
    });
}

function loadShopsOnMap(pos) {
    if (!mapInstance) return;

    // Effacer les anciens marqueurs
    mapMarkers.forEach(m => mapInstance.removeLayer(m));
    mapMarkers = [];

    // Afficher les boutiques
    SHOPS.forEach(shop => {
        const dist = getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
        if (dist > 20) return; // Ignorer les boutiques trop loin

        const isOpen = shop.status === 'open';
        const statusColor = isOpen ? '#10B981' : '#EF4444';

        const marker = L.marker([shop.lat, shop.lng], {
            icon: L.divIcon({
                className: 'shop-marker',
                html: `<i class="fas fa-store" style="color:white;font-size:14px;background:${statusColor};padding:6px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></i>`,
                iconSize: [30, 30]
            })
        }).addTo(mapInstance);

        // Popup
        const products = PRODUCTS.filter(p => p.shopId === shop.id);
        const productList = products.map(p => 
            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;">
                <span>${p.name}</span>
                <span style="font-weight:600;">${p.price.toFixed(2)} $</span>
            </div>`
        ).join('');

        marker.bindPopup(`
            <div style="min-width:200px;">
                <h4 style="margin:0 0 4px 0;">${shop.name}</h4>
                <p style="margin:0 0 8px 0;font-size:12px;color:#6B7280;">${shop.address}</p>
                ${renderShopStatus(shop)}
                <div style="margin:8px 0;">
                    <strong>Produits :</strong>
                    ${productList || 'Aucun produit'}
                </div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="getDirectionsStatic(${shop.lat}, ${shop.lng})">
                        <i class="fas fa-map-pin"></i> Itinéraire
                    </button>
                    <button class="btn-outline btn-sm" onclick="doCheckIn(${shop.id})">
                        <i class="fas fa-check"></i> Check-in
                    </button>
                </div>
            </div>
        `);

        mapMarkers.push(marker);

        // Flash Deals sur la carte
        const deals = FLASH_DEALS.filter(d => d.shopId === shop.id);
        deals.forEach(deal => {
            const dealMarker = L.marker([shop.lat + 0.001, shop.lng + 0.001], {
                icon: L.divIcon({
                    className: 'flash-deal-marker',
                    html: `<i class="fas fa-bolt"></i> -${deal.discount}%`,
                    iconSize: [60, 26]
                })
            }).addTo(mapInstance);
            mapMarkers.push(dealMarker);
        });
    });

    // Afficher les collections
    COLLECTIONS.forEach(col => {
        const centerLat = col.shops.reduce((sum, id) => {
            const s = SHOPS.find(sh => sh.id === id);
            return sum + (s ? s.lat : 0);
        }, 0) / col.shops.length;
        const centerLng = col.shops.reduce((sum, id) => {
            const s = SHOPS.find(sh => sh.id === id);
            return sum + (s ? s.lng : 0);
        }, 0) / col.shops.length;

        const marker = L.marker([centerLat, centerLng], {
            icon: L.divIcon({
                className: 'collection-marker',
                html: `<i class="fas fa-flag"></i> ${col.name}`,
                iconSize: [80, 28]
            })
        }).addTo(mapInstance);
        mapMarkers.push(marker);
        marker.bindPopup(`
            <h4>${col.name}</h4>
            <p>${col.description}</p>
            <button class="btn-outline btn-sm" onclick="startCollectionRoute(${col.id})">
                <i class="fas fa-route"></i> Parcours
            </button>
        `);
    });
}

function filterMarkers(query) {
    if (!mapInstance) return;
    // On cache/affiche les marqueurs selon la recherche
    // Pour simplifier, on refait un filtrage avec les popups
    // Dans une version pro, on gère ça avec des layers
}

function getDirectionsStatic(lat, lng) {
    getUserPosition().then(pos => {
        const url = `https://www.google.com/maps/dir/${pos.lat},${pos.lng}/${lat},${lng}`;
        window.open(url, '_blank');
    });
}

function doCheckIn(shopId) {
    getUserPosition().then(pos => {
        const shop = SHOPS.find(s => s.id === shopId);
        if (!shop) return;

        const dist = getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
        if (dist > 0.1) {
            showToast('Tu dois être à moins de 100m de la boutique', 'warning');
            return;
        }

        // Appel API simulé
        showToast('Check-in validé ! +10 points', 'success');
        CURRENT_USER.points += 10;
        const profilePointsEl = document.querySelector('.profile-stats strong');
        if (profilePointsEl) {
            profilePointsEl.textContent = CURRENT_USER.points;
        }
    });
}

function startCollectionRoute(collectionId) {
    const col = COLLECTIONS.find(c => c.id === collectionId);
    if (!col) return;
    const shops = col.shops.map(id => SHOPS.find(s => s.id === id)).filter(Boolean);
    const waypoints = shops.map(s => ({ lat: s.lat, lng: s.lng, name: s.name }));
    navigateTo('feed');
    // On passe les waypoints au mode parcours
    setTimeout(() => startParcours(waypoints), 300);
}