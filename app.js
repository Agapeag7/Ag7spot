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

function attachNavigationHandlers() {
    document.removeEventListener('click', handleGlobalNavigationClick);
    document.addEventListener('click', handleGlobalNavigationClick);
}

function handleGlobalNavigationClick(event) {
    const navButton = event.target.closest('.nav-item');
    if (navButton) {
        event.preventDefault();
        navigateTo(navButton.dataset.page);
        return;
    }

    const link = event.target.closest('[data-nav]');
    if (link) {
        event.preventDefault();
        navigateTo(link.dataset.nav);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    attachNavigationHandlers();

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
        updateHeaderActionsVisibility();
        navigateTo('auth');
        return;
    }

    updateHeaderActionsVisibility();

    // Vérifier si l'onboarding doit être affiché (par utilisateur)
    if (CURRENT_USER && CURRENT_USER.id) {
        const onboardingKey = `onboarding_done_${CURRENT_USER.id}`;
        const onboardingDone = localStorage.getItem(onboardingKey);
        if (!onboardingDone) {
            renderOnboarding();
            document.getElementById('onboardingModal').classList.remove('hidden');
        }
    }

    // Charger la page par défaut
    navigateTo('feed');
    appInitialized = true;
    updateHeaderActionsVisibility();

    // Service Worker pour le hors-ligne
    const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const canRegisterSW = ('serviceWorker' in navigator) && (location.protocol === 'https:' || (location.protocol === 'http:' && isLocalhost));
    if (canRegisterSW) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW enregistré'))
            .catch(err => console.warn('SW erreur:', err));
    } else if ('serviceWorker' in navigator) {
        console.warn('SW non enregistré : service worker nécessite soit https, soit http sur localhost', location.protocol, location.hostname);
    }
});

async function logout() {
    try {
        await logoutApi();
    } catch (error) {
        console.warn('Logout API failed, clearing local state anyway');
    }

    if (CURRENT_USER && CURRENT_USER.id) {
        localStorage.removeItem(`onboarding_done_${CURRENT_USER.id}`);
        localStorage.removeItem(`user_categories_${CURRENT_USER.id}`);
    }
    localStorage.removeItem('ag7_current_user');
    CURRENT_USER.id = null;
    CURRENT_USER.username = '';
    CURRENT_USER.points = 0;
    CURRENT_USER.avatar = '';
    CURRENT_USER.shopId = null;
    CURRENT_USER.role = 'buyer';
    updateHeaderActionsVisibility();
    navigateTo('auth');
}

function clearClientSession() {
    if (window.CURRENT_USER && window.CURRENT_USER.id) {
        try {
            localStorage.removeItem(`onboarding_done_${window.CURRENT_USER.id}`);
            localStorage.removeItem(`user_categories_${window.CURRENT_USER.id}`);
        } catch (e) {}
    }
    localStorage.removeItem('ag7_current_user');
    if (window.CURRENT_USER) {
        window.CURRENT_USER.id = null;
        window.CURRENT_USER.username = '';
        window.CURRENT_USER.points = 0;
        window.CURRENT_USER.avatar = '';
        window.CURRENT_USER.shopId = null;
        window.CURRENT_USER.role = 'buyer';
    }
    updateHeaderActionsVisibility();
    navigateTo('auth');
}

function navigateToAddShop() {
    window.forceShopCreation = true;
    navigateTo('add');
}

function updateHeaderActionsVisibility() {
    const headerActions = document.querySelector('.header-actions');
    const bottomNav = document.querySelector('.bottom-nav');
    if (headerActions) {
        if (CURRENT_USER && CURRENT_USER.id) {
            headerActions.classList.add('show');
        } else {
            headerActions.classList.remove('show');
        }
    }
    if (bottomNav) {
        if (CURRENT_USER && CURRENT_USER.id) {
            bottomNav.classList.remove('hidden');
        } else {
            bottomNav.classList.add('hidden');
        }
    }
}

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
            renderShopOrProduct(container);
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
window.navigateToAddShop = navigateToAddShop;
window.logout = logout;
window.clearClientSession = clearClientSession;
window.showToast = showToast;
window.getUserPosition = getUserPosition;
window.getDistanceBetween = getDistanceBetween;
window.isNearShop = isNearShop;
window.SHOPS = SHOPS;
window.PRODUCTS = PRODUCTS;
window.COLLECTIONS = COLLECTIONS;
window.CURRENT_USER = CURRENT_USER;
window.FLASH_DEALS = FLASH_DEALS;