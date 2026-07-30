// =========================================
// SERVICE : MODE HORS-LIGNE (Service Worker + IndexedDB)
// =========================================
const DB_NAME = 'ag7spot_offline';
const DB_VERSION = 1;

function openOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('tiles')) {
                db.createObjectStore('tiles', { keyPath: 'url' });
            }
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'key' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveTile(url, blob) {
    const db = await openOfflineDB();
    const tx = db.transaction('tiles', 'readwrite');
    tx.objectStore('tiles').put({ url, blob });
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

async function getTile(url) {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('tiles', 'readonly');
        const request = tx.objectStore('tiles').get(url);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function preloadMapTiles(centerLat, centerLng, zoom = 15, radius = 2) {
    showToast('🗺️ Téléchargement des tuiles...', 'info');

    // Calcul des tuiles OSM (simplifié)
    const tiles = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            const tileUrl = `https://tile.openstreetmap.org/${zoom}/${Math.floor(centerLat) + x}/${Math.floor(centerLng) + y}.png`;
            tiles.push(tileUrl);
        }
    }

    let loaded = 0;
    for (const url of tiles) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                await saveTile(url, blob);
                loaded++;
            }
        } catch (e) {
            console.warn('Erreur tile:', url);
        }
    }

    showToast(`✅ ${loaded} tuiles téléchargées pour le hors-ligne`, 'success');
    localStorage.setItem('offline_tiles_downloaded', 'true');
}

function isOfflineModeAvailable() {
    return localStorage.getItem('offline_tiles_downloaded') === 'true';
}

// Intercepter les requêtes de tuiles pour servir depuis IndexedDB
// (À mettre dans le Service Worker)
const SW_CODE = `
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('tile.openstreetmap.org')) {
        event.respondWith(
            caches.open('ag7spot-tiles').then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(fetchResponse => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
    }
});
`;

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
    // Le code ci-dessus est à placer dans un fichier sw.js séparé
    // Pour l'exemple, on le fait ici
    const swBlob = new Blob([SW_CODE], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(swBlob);
    // navigator.serviceWorker.register(swUrl) // Décommenter pour production
}

// Exposer
window.preloadMapTiles = preloadMapTiles;
window.isOfflineModeAvailable = isOfflineModeAvailable;