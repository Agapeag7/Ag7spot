// =========================================
// PAGE : COLLECTIONS DE QUARTIER
// =========================================
function renderCollections(container) {
    container.innerHTML = `
        <div class="page active">
            <div class="section-title">
                <span><i class="fas fa-flag"></i> Collections de quartier</span>
                <a href="#" onclick="showCreateCollection()"><i class="fas fa-plus"></i> Créer</a>
            </div>
            <div id="collectionsContainer"></div>
        </div>
    `;

    loadCollections();
}

function loadCollections() {
    const container = document.getElementById('collectionsContainer');

    if (COLLECTIONS.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-flag"></i>
                <p>Aucune collection pour le moment.</p>
                <button class="btn-primary btn-sm" onclick="showCreateCollection()">Créer une collection</button>
            </div>
        `;
        return;
    }

    container.innerHTML = COLLECTIONS.map(col => {
        const shopNames = col.shops.map(id => {
            const s = SHOPS.find(sh => sh.id === id);
            return s ? s.name : 'Inconnu';
        }).join(', ');
        return `
            <div class="product-card" onclick="startCollectionRoute(${col.id})">
                <div style="padding:16px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);">
                    <h3 style="margin:0;"><i class="fas fa-flag" style="color:var(--primary);"></i> ${col.name}</h3>
                    <p style="margin:4px 0 0 0;color:var(--text-gray);font-size:14px;">${col.description}</p>
                    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
                        ${col.shops.map(id => {
                            const s = SHOPS.find(sh => sh.id === id);
                            return s ? `<span class="tag"><i class="fas fa-store"></i> ${s.name}</span>` : '';
                        }).join('')}
                    </div>
                    <button class="btn-primary btn-sm" style="margin-top:10px;" onclick="event.stopPropagation();startCollectionRoute(${col.id})">
                        <i class="fas fa-route"></i> Faire le parcours
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showCreateCollection() {
    const name = prompt('Nom de la collection :');
    if (!name) return;
    const desc = prompt('Description :');
    if (!desc) return;

    // Sélectionner des boutiques (simplifié)
    const shopList = SHOPS.map(s => `${s.id}: ${s.name}`).join('\n');
    const ids = prompt(`Entrez les IDs des boutiques (séparés par des virgules) :\n${shopList}`);
    if (!ids) return;

    const shopIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (shopIds.length === 0) {
        showToast('Aucune boutique sélectionnée', 'warning');
        return;
    }

    COLLECTIONS.push({
        id: Date.now(),
        name,
        description: desc,
        shops: shopIds,
        creator: CURRENT_USER.id
    });

    loadCollections();
    showToast('✅ Collection créée !', 'success');
}

function startCollectionRoute(collectionId) {
    const col = COLLECTIONS.find(c => c.id === collectionId);
    if (!col) return;
    const waypoints = col.shops.map(id => {
        const s = SHOPS.find(sh => sh.id === id);
        return s ? { lat: s.lat, lng: s.lng, name: s.name } : null;
    }).filter(Boolean);

    if (waypoints.length < 2) {
        showToast('Cette collection a moins de 2 boutiques', 'warning');
        return;
    }

    // Naviguer vers le parcours
    navigateTo('feed');
    setTimeout(() => startParcours(waypoints), 300);
}

// Exposer pour les appels
window.startCollectionRoute = startCollectionRoute;