// =========================================
// APPLICATION PRINCIPALE (ROUTAGE, INIT)
// =========================================
let currentPage = 'feed';
let appInitialized = false;

function loadStoredUser() {
    const stored = localStorage.getItem('ag7_current_user');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const storedUser = loadStoredUser();
    if (storedUser) {
        if (typeof applyStoredUser === 'function') {
            applyStoredUser(storedUser);
        } else {
            CURRENT_USER.id = storedUser.id || CURRENT_USER.id;
            CURRENT_USER.username = storedUser.username || CURRENT_USER.username;
            CURRENT_USER.points = storedUser.points ?? CURRENT_USER.points;
            CURRENT_USER.avatar = storedUser.avatar || CURRENT_USER.avatar;
            CURRENT_USER.shopId = storedUser.shopId || null;
            CURRENT_USER.role = storedUser.role || CURRENT_USER.role;
        }
    }

    if (!CURRENT_USER || !CURRENT_USER.id) {
        navigateTo('auth');
        return;
    }

    // Vérifier si l'onboarding doit être affiché
    const onboardingDone = localStorage.getItem('onboarding_done');
    if (!onboardingDone) {
        renderOnboarding();
        document.getElementById('onboardingModal').classList.remove('hidden');
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    // Liens internes
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-nav]');
        if (link) {
            e.preventDefault();
            navigateTo(link.dataset.nav);
        }
    });

    // Initialiser la géolocalisation
    try {
        const pos = await getUserPosition();
        console.log('Position utilisateur:', pos);
    } catch (e) {
        console.warn('Erreur géoloc:', e);
    }

    // Charger la page par défaut
    navigateTo('feed');
    appInitialized = true;

    // Service Worker pour le hors-ligne
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW enregistré'))
            .catch(err => console.warn('SW erreur:', err));
    } else if ('serviceWorker' in navigator) {
        console.warn('SW non enregistré : protocole non sécurisé ou environnement local invalide', location.protocol);
    }
});

function navigateTo(page) {
    if (page !== 'auth' && (!CURRENT_USER || !CURRENT_USER.id)) {
        page = 'auth';
    }

    // Mettre à jour la nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');

    currentPage = page;

    // Charger la page correspondante
    const container = document.getElementById('pageContainer');

    switch(page) {
        case 'feed':
            renderFeed(container);
            break;
        case 'map':
            renderMap(container);
            break;
        case 'parcours':
            renderParcours(container);
            break;
        case 'add':
            renderAddProduct(container);
            break;
        case 'auth':
            renderAuth(container);
            break;
        case 'favorites':
            renderFavorites(container);
            break;
        case 'profile':
            renderProfile(container);
            break;
        default:
            container.innerHTML = '<p>Page en construction</p>';
    }

    // Scroll en haut
    document.getElementById('mainContent').scrollTop = 0;
}

// Exposer globalement pour les appels depuis les pages
window.navigateTo = navigateTo;
window.showToast = showToast;
window.getUserPosition = getUserPosition;
window.getDistanceBetween = getDistanceBetween;
window.isNearShop = isNearShop;
window.SHOPS = SHOPS;
window.PRODUCTS = PRODUCTS;
window.COLLECTIONS = COLLECTIONS;
window.CURRENT_USER = CURRENT_USER;
window.FLASH_DEALS = FLASH_DEALS;