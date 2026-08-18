// =========================================
// PAGE : CARTE
// =========================================
function renderMap(container) {
    // Si une instance Leaflet existe encore (retour depuis une autre page), la détruire
    try {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
            mapMarkers = [];
            userMarker = null;
            routeLayer = null;
        }
    } catch (e) {
        console.warn('Erreur lors de la suppression de l\'ancienne carte :', e);
    }

    container.innerHTML = `
        <div class="page active">
            <div class="map-controls">
                <input type="text" placeholder="Rechercher un produit ou une boutique..." id="searchMap" />
                <button class="btn-outline" id="routeBtn"><i class="fas fa-route"></i></button>
                <button class="btn-outline" id="locateBtn"><i class="fas fa-location-arrow"></i></button>
            </div>
            <div id="mapSummary" class="map-summary"></div>
            <div id="map"></div>
            <p class="map-hint"><i class="fas fa-info-circle"></i> Les boutiques affichées sont celles à proximité de votre position.</p>
        </div>
    `;

    // Initialiser la carte après un court délai
    setTimeout(() => initMap(), 300);
}

let mapInstance = null;
let mapMarkers = [];
let userMarker = null;
let currentMapPosition = null;
let currentSearchQuery = '';
let routeLayer = null;

async function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    try {
        const pos = await getUserPosition(true);
        currentMapPosition = pos;

        if (!userPosition) {
            showToast('Localisation non autorisée : affichage par défaut.', 'warning');
        }

        if (mapInstance) {
            mapInstance.invalidateSize();
            loadShopsOnMap(currentMapPosition, currentSearchQuery);
            return;
        }

        mapInstance = L.map('map').setView([pos.lat, pos.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(mapInstance);

        // Marqueur utilisateur
        userMarker = L.marker([pos.lat, pos.lng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<i class="fas fa-circle" style="color:#6C3BFF;font-size:18px;"></i>',
                iconSize: [18, 18]
            })
        }).addTo(mapInstance).bindPopup('Vous êtes ici');

        // Charger les boutiques
        loadShopsOnMap(pos);

        // Bouton parcours
        document.getElementById('routeBtn')?.addEventListener('click', () => {
            if (window.routeWaypoints && window.routeWaypoints.length > 0) {
                navigateTo('parcours');
                return;
            }
            showToast('Ajoute d\'abord des boutiques au parcours', 'warning');
        });

        // Bouton localisation
        document.getElementById('locateBtn')?.addEventListener('click', async () => {
            try {
                const newPos = await getUserPosition();
                currentMapPosition = newPos;
                if (userMarker) {
                    userMarker.setLatLng([newPos.lat, newPos.lng]);
                }
                mapInstance.setView([newPos.lat, newPos.lng], 15);
                loadShopsOnMap(newPos, currentSearchQuery);
                showToast('Position mise à jour', 'info');
            } catch (error) {
                showToast('Autorise la localisation pour mettre à jour la carte.', 'warning');
            }
        });

        // Recherche
        document.getElementById('searchMap')?.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterMarkers(query);
        });
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        mapContainer.innerHTML = '<div class="empty-state"><i class="fas fa-location-dot"></i><p>Autorise la localisation pour afficher les boutiques autour de vous.</p></div>';
        showToast('Autorise la localisation pour afficher la carte.', 'warning');
    }
}

async function loadShopsOnMap(pos, query = '') {
    if (!mapInstance || !pos) return;

    currentMapPosition = pos;
    currentSearchQuery = query.trim();
    const visibleShops = [];
    const nearbyRadiusKm = 10;

    mapMarkers.forEach(m => mapInstance.removeLayer(m));
    mapMarkers = [];

    const matchesShopQuery = (shop) => {
        if (!currentSearchQuery) return true;
        const productNames = PRODUCTS.filter(p => p.shopId === shop.id).map(p => p.name).join(' ');
        const combined = `${shop.name || ''} ${shop.address || ''} ${shop.category || ''} ${productNames}`;
        return matchesQuery(combined, currentSearchQuery);
    };

    const matchesCollectionQuery = (col) => {
        if (!currentSearchQuery) return true;
        const shopNames = col.shops.map(id => {
            const s = SHOPS.find(sh => sh.id === id);
            return s ? s.name : '';
        }).join(' ');
        const combined = `${col.name || ''} ${col.description || ''} ${shopNames}`;
        return matchesQuery(combined, currentSearchQuery);
    };

    let shops = SHOPS;
    try {
        shops = await getNearbyShops(pos.lat, pos.lng, nearbyRadiusKm);
        if (Array.isArray(shops) && shops.length > 0) {
            SHOPS.length = 0;
            shops.forEach(shop => SHOPS.push(shop));
        }
        // Met à jour le badge du menu 'Carte' avec le nombre de boutiques dans un rayon de 10km
        try {
            const badgeEl = document.getElementById('dealBadge');
            if (badgeEl) {
                const countNearby = (shops || []).reduce((acc, shop) => {
                    const d = parseFloat(shop.distance) || getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
                    return acc + (d <= 10 ? 1 : 0);
                }, 0);
                // Limiter l'affichage à 99+
                badgeEl.textContent = countNearby > 99 ? '99+' : String(countNearby);
                badgeEl.style.display = countNearby ? 'inline-block' : 'none';
            }
        } catch (e) {
            console.warn('Erreur lors de la mise à jour du badge map:', e);
        }
    } catch (error) {
        console.warn('Impossible de récupérer les boutiques via l\'API, utilisation des données locales.', error);
        shops = SHOPS;
    }

    shops.forEach(shop => {
        if (!shop.owner_id && !shop.ownerId) return;
        const dist = parseFloat(shop.distance) || getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
        if (dist > nearbyRadiusKm || !matchesShopQuery(shop)) return;

        visibleShops.push({
            id: shop.id,
            name: shop.name,
            dist,
            status: shop.status,
            selected: window.routeWaypoints?.some(w => w.lat === shop.lat && w.lng === shop.lng)
        });

        const isOpen = shop.status === 'open';
        const statusColor = isOpen ? '#10B981' : '#EF4444';
        const selected = window.routeWaypoints?.some(w => w.lat === shop.lat && w.lng === shop.lng);
        const routeButton = selected
            ? `<button class="btn-outline btn-sm" disabled><i class="fas fa-check"></i> Ajouté au parcours</button>`
            : `<button class="btn-outline btn-sm" onclick="addRoutePoint(${shop.id})"><i class="fas fa-route"></i> Ajouter au parcours</button>`;

        const products = PRODUCTS.filter(p => p.shopId === shop.id);
        const productList = products.map(p => 
            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;">
                <span>${p.name}</span>
                <span style="font-weight:600;">${parseFloat(p.price).toFixed(2)} $</span>
            </div>`
        ).join('');

        const deals = FLASH_DEALS.filter(d => d.shopId === shop.id);
        const dealsHtml = deals.length ? `
            <div style="margin:8px 0;padding:8px;background:#f9fafb;border-radius:12px;">
                <strong>Flash deals :</strong>
                ${deals.map(d => `<span style="display:inline-block;margin-top:4px;padding:4px 6px;background:#fde68a;border-radius:12px;font-size:12px;">-${d.discount}%</span>`).join(' ')}
            </div>
        ` : '';

        const marker = L.marker([shop.lat, shop.lng], {
            icon: L.divIcon({
                className: 'shop-marker',
                html: `<div style="display:flex;flex-direction:column;align-items:center;">
                    <span style="font-size:11px;font-weight:700;color:white;padding:2px 6px;border-radius:10px;background:${statusColor};margin-bottom:4px;box-shadow:0 1px 4px rgba(0,0,0,0.12);">${shop.name}</span>
                    <i class="fas fa-store" style="color:white;font-size:14px;background:${statusColor};padding:6px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></i>
                </div>`,
                iconSize: [90, 60],
                className: 'shop-marker-with-label'
            })
        }).addTo(mapInstance);

        marker.bindPopup(`
            <div style="min-width:220px;">
                <h4 style="margin:0 0 4px 0;">${shop.name}</h4>
                <p style="margin:0 0 8px 0;font-size:12px;color:#6B7280;">${shop.address}</p>
                ${renderShopStatus(shop)}
                ${dealsHtml}
                <div style="margin:8px 0;">
                    <strong>Produits :</strong>
                    ${productList || 'Aucun produit'}
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button class="btn-outline btn-sm" onclick="getDirectionsStatic(${shop.lat}, ${shop.lng})">
                        <i class="fas fa-map-pin"></i> Itinéraire
                    </button>
                    <button class="btn-outline btn-sm" onclick="doCheckIn(${shop.id})">
                        <i class="fas fa-check"></i> Check-in
                    </button>
                    ${routeButton}
                </div>
            </div>
        `);

        mapMarkers.push(marker);
    });

    COLLECTIONS.forEach(col => {
        if (!matchesCollectionQuery(col)) return;
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
            <div style="min-width:220px;">
                <h4 style="margin:0 0 4px 0;">${col.name}</h4>
                <p style="margin:0 0 8px 0;font-size:12px;color:#6B7280;">${col.description}</p>
                <div style="margin-bottom:8px;font-size:12px;color:#4B5563;">${col.shops.map(id => {
                    const shop = SHOPS.find(sh => sh.id === id);
                    return shop ? shop.name : 'Inconnu';
                }).join(', ')}</div>
                <button class="btn-outline btn-sm" onclick="startCollectionRoute(${col.id})">
                    <i class="fas fa-route"></i> Parcours
                </button>
            </div>
        `);
    });

    const summaryContainer = document.getElementById('mapSummary');
    if (summaryContainer) {
        if (visibleShops.length === 0) {
            summaryContainer.innerHTML = `<div class="map-summary-empty">Aucune boutique trouvée à proximité. Ajuste la recherche ou la position.</div>`;
        } else {
            summaryContainer.innerHTML = `
                <div class="map-summary-card">
                    <strong>${visibleShops.length} boutiques à proximité</strong>
                    ${visibleShops.length > 5 ? `<div class="shop-label-more">+${visibleShops.length - 5} autres</div>` : ''}
                </div>
            `;
        }
    }
}

function filterMarkers(query) {
    if (!mapInstance || !currentMapPosition) return;
    loadShopsOnMap(currentMapPosition, query);
}

function getDirectionsStatic(lat, lng) {
    getUserPosition().then(pos => {
        const url = `https://www.google.com/maps/dir/${pos.lat},${pos.lng}/${lat},${lng}`;
        window.open(url, '_blank');
    });
}

async function doCheckIn(shopId) {
    try {
        const pos = await getUserPosition();
        currentMapPosition = pos;
        if (pos.accuracy && pos.accuracy > 100) {
            showToast('Position trop imprécise pour un check-in', 'warning');
            return;
        }

        const shop = SHOPS.find(s => s.id === shopId);
        if (!shop) return;

        if (shop.status !== 'open') {
            showToast('Impossible de check-in : boutique fermée ou en pause', 'warning');
            return;
        }

        const dist = getDistanceBetween(pos.lat, pos.lng, shop.lat, shop.lng);
        if (dist > 0.1) {
            showToast('Tu dois être à moins de 100m de la boutique', 'warning');
            return;
        }

        const result = await checkIn(shopId);
        if (result && result.success) {
            CURRENT_USER.points = result.points || CURRENT_USER.points + 10;
            const profilePointsEl = document.querySelector('.profile-stats strong:last-child');
            if (profilePointsEl) {
                profilePointsEl.textContent = CURRENT_USER.points;
            }
            showToast('Check-in validé ! +10 points', 'success');
        } else {
            showToast(result.error || 'Échec du check-in', 'error');
        }
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        showToast('Impossible de faire le check-in.', 'error');
    }
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