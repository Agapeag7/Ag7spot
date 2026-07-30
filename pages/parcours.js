// =========================================
// PAGE : MODE PARCOURS (Itinéraire multi-boutiques)
// =========================================
let selectedForRoute = [];
let routeWaypoints = [];

function renderParcours(container, initialWaypoints = null) {
    if (initialWaypoints) {
        routeWaypoints = initialWaypoints;
    }

    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span><i class="fas fa-route"></i> Mode Parcours</span>
                <a href="#" onclick="navigateTo('map')">Retour</a>
            </div>
            <div class="route-selector">
                <label><input type="radio" name="transport" value="walking" checked /> <i class="fas fa-walking"></i> À pied</label>
                <label><input type="radio" name="transport" value="driving" /> <i class="fas fa-car"></i> Voiture</label>
            </div>
            <div id="routeShopList"></div>
            <button class="btn-primary w-full" id="calculateRouteBtn">
                <i class="fas fa-sync-alt"></i> Calculer l'itinéraire
            </button>
            <div id="routeResult"></div>
        </div>
    `;

    renderRouteShopList();

    document.getElementById('calculateRouteBtn').addEventListener('click', calculateRoute);
}

function renderRouteShopList() {
    const container = document.getElementById('routeShopList');
    if (routeWaypoints.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-store"></i>
                <p>Sélectionne des boutiques sur la carte pour créer ton parcours.</p>
                <button class="btn-primary btn-sm" onclick="navigateTo('map')">Choisir des boutiques</button>
            </div>
        `;
        return;
    }

    container.innerHTML = routeWaypoints.map((wp, index) => `
        <div class="follow-item" style="margin-bottom:8px;">
            <span style="font-weight:700;color:var(--primary);min-width:24px;">${index + 1}</span>
            <div class="name">${wp.name}</div>
            <button class="btn-outline btn-sm" onclick="removeRoutePoint(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addRoutePoint(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;
    if (routeWaypoints.some(w => w.lat === shop.lat && w.lng === shop.lng)) {
        showToast('Déjà dans le parcours', 'warning');
        return;
    }
    routeWaypoints.push({ lat: shop.lat, lng: shop.lng, name: shop.name });
    renderRouteShopList();
}

function removeRoutePoint(index) {
    routeWaypoints.splice(index, 1);
    renderRouteShopList();
    document.getElementById('routeResult').innerHTML = '';
}

async function calculateRoute() {
    if (routeWaypoints.length < 2) {
        showToast('Ajoute au moins 2 boutiques', 'warning');
        return;
    }

    const btn = document.getElementById('calculateRouteBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calcul en cours...';

    const transport = document.querySelector('input[name="transport"]:checked').value;

    try {
        const pos = await getUserPosition();
        const allPoints = [{ lat: pos.lat, lng: pos.lng, name: 'Départ' }, ...routeWaypoints];

        // Simulation de calcul (remplacer par appel API)
        // Ici on simule un itinéraire simple
        setTimeout(() => {
            const totalDist = allPoints.reduce((sum, p, i) => {
                if (i === 0) return 0;
                const prev = allPoints[i-1];
                return sum + getDistanceBetween(prev.lat, prev.lng, p.lat, p.lng);
            }, 0);

            const totalTime = Math.round(totalDist * 15); // 15 min/km

            document.getElementById('routeResult').innerHTML = `
                <div class="route-summary">
                    <div class="route-icon"><i class="fas fa-route"></i></div>
                    <div class="route-info">
                        <strong>${totalDist.toFixed(1)} km</strong>
                        <span class="text-muted"> · ${totalTime} min</span>
                        <br>
                        <span class="text-muted">${routeWaypoints.length} boutiques visitées</span>
                    </div>
                    <button class="btn-primary btn-sm" onclick="startNavigation()">
                        <i class="fas fa-play"></i> Démarrer
                    </button>
                </div>
                <div style="margin-top:12px;background:white;border-radius:16px;padding:16px;box-shadow:var(--shadow);">
                    <p style="font-weight:600;margin-bottom:8px;"><i class="fas fa-list-ul"></i> Ordre optimal :</p>
                    ${allPoints.map((p, i) => `
                        <div style="display:flex;align-items:center;gap:8px;padding:4px 0;${i === 0 ? 'color:var(--primary);' : ''}">
                            <span style="font-weight:700;min-width:24px;">${i + 1}</span>
                            <span>${p.name}</span>
                            ${i < allPoints.length - 1 ? '<i class="fas fa-arrow-right" style="color:var(--text-gray);font-size:12px;"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Recalculer';
            showToast('Itinéraire calculé !', 'success');
        }, 800);

    } catch (e) {
        showToast('Erreur de calcul', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Calculer';
    }
}

function startNavigation() {
    // Ouvrir Google Maps avec tous les points
    getUserPosition().then(pos => {
        const points = [{ lat: pos.lat, lng: pos.lng }, ...routeWaypoints];
        const url = `https://www.google.com/maps/dir/${points.map(p => `${p.lat},${p.lng}`).join('/')}`;
        window.open(url, '_blank');
    });
}

// Fonction pour lancer le parcours depuis une collection
function startParcours(waypoints) {
    routeWaypoints = waypoints;
    const container = document.getElementById('pageContainer');
    renderParcours(container);
    // Activer la page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageContainer').querySelector('.page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
}

// Exposer pour les appels depuis la carte
window.addRoutePoint = addRoutePoint;
window.removeRoutePoint = removeRoutePoint;
window.startParcours = startParcours;
window.routeWaypoints = routeWaypoints;