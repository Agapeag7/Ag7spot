// =========================================
// APPLICATION PRINCIPALE (ROUTAGE, INIT)
// =========================================
let currentPage = 'feed';
let appInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier si l'onboarding doit être affiché
    const onboardingDone = localStorage.getItem('onboarding_done');
    if (!onboardingDone) {
        renderOnboarding();
        document.getElementById('onboardingModal').classList.remove('hidden');
    }

    // Initialiser la géolocalisation
    try {
        const pos = await getUserPosition();
        console.log('Position utilisateur:', pos);
    } catch (e) {
        console.warn('Erreur géoloc:', e);
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
        case 'add':
            renderAddProduct(container);
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