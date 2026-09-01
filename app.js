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

function escapeNotificationText(value) {
    const element = document.createElement('div');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.toggle('hidden', !count);
}

function refreshNotificationBadge() {
    if (!CURRENT_USER || !CURRENT_USER.id || typeof getNotifications !== 'function') return;
    getNotifications()
        .then(response => updateNotificationBadge(response.unread_count || 0))
        .catch(() => {});
}

function handleNotificationRoute(notification) {
    if (!notification) return;

    const type = String(notification.type || '').toLowerCase();
    const data = notification.data || {};

    if (type === 'shop_status') {
        return;
    }

    if (type === 'shop_updated') {
        navigateTo('map');
        return;
    }

    if (type === 'new_message') {
        const productId = Number(data.product_id || data.productId || notification.product_id || 0);
        if (productId) {
            navigateTo('feed');
            setTimeout(() => {
                if (typeof openChat === 'function') {
                    openChat(productId);
                }
            }, 350);
            return;
        }
    }

    const query = (
        data.product_name ||
        data.shop_name ||
        notification.title ||
        notification.body ||
        ''
    ).toString().trim();

    if (!query) {
        navigateTo('feed');
        return;
    }

    navigateTo('feed');
    setTimeout(() => {
        const searchInput = document.getElementById('feedSearchInput');
        if (!searchInput) return;
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }, 350);
}

async function toggleFeedFollow(shopId, isFollowed = false, button = null) {
    if (!shopId) {
        showToast('Boutique introuvable.', 'error');
        return;
    }
    try {
        const response = isFollowed ? await unfollowShop(shopId) : await followShop(shopId);
        if (!response.success) throw new Error('Impossible de suivre cette boutique.');
        if (typeof recordUserInteraction === 'function') {
            recordUserInteraction('follow_shop', { shop_id: shopId }, window.CURRENT_USER?.id || null);
        }
        if (!isFollowed && typeof addFollowedShop === 'function') {
            addFollowedShop(shopId, window.CURRENT_USER?.id || null);
        }
        if (isFollowed && typeof removeFollowedShop === 'function') {
            removeFollowedShop(shopId, window.CURRENT_USER?.id || null);
        }
        if (button) {
            button.innerHTML = `<i class="fas fa-heart"></i> ${isFollowed ? 'Suivre' : 'Suivi(e)'}`;
            button.setAttribute('onclick', `event.stopPropagation(); toggleFeedFollow(${Number(shopId)}, ${!isFollowed}, this)`);
        }
        showToast(isFollowed ? 'Boutique retirée des suivis' : 'Boutique suivie', 'success');
    } catch (error) {
        showToast(error.message || 'Impossible de suivre cette boutique.', 'error');
    }
}

async function openNotifications() {
    if (!CURRENT_USER || !CURRENT_USER.id) {
        return;
    }
    try {
        const PAGE_SIZE = 30;
        const response = await getNotifications(PAGE_SIZE, 0);
        const notifications = response.notifications || [];
        const notificationMap = new Map(notifications.map(item => [String(Number(item.id)), item]));
        let notificationOffset = notifications.length;
        let notificationLoading = false;
        let notificationHasMore = notifications.length === PAGE_SIZE;
        updateNotificationBadge(response.unread_count || 0);

        const renderNotificationItem = (notification) => `
            <button class="notification-item ${notification.read_at ? '' : 'unread'}" data-notification-id="${Number(notification.id)}">
                <span class="notification-item-icon"><i class="fas fa-${notification.type === 'new_message' ? 'comment' : notification.type === 'new_product' ? 'box-open' : 'store'}"></i></span>
                <span class="notification-item-content">
                    <strong>${escapeNotificationText(notification.title)}</strong>
                    <span>${escapeNotificationText(notification.body)}</span>
                    <small>${escapeNotificationText(notification.created_at)}</small>
                </span>
                ${notification.read_at ? '' : '<span class="notification-unread-dot" aria-label="Non lue"></span>'}
            </button>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal notification-modal';
        modal.innerHTML = `
            <div class="modal-content notification-panel" role="dialog" aria-modal="true" aria-labelledby="notificationTitle">
                <div class="notification-header">
                    <div class="notification-heading">
                        <span class="notification-heading-icon"><i class="fas fa-bell"></i></span>
                        <div>
                            <h3 id="notificationTitle">Notifications</h3>
                            <p>${response.unread_count ? `${Number(response.unread_count)} non lue${Number(response.unread_count) > 1 ? 's' : ''}` : 'Tout est à jour'}</p>
                        </div>
                    </div>
                    <button class="modal-close" type="button" aria-label="Fermer"><i class="fas fa-times"></i></button>
                </div>
                <div class="notification-list">
                    ${notifications.length ? notifications.map(renderNotificationItem).join('') : '<p class="empty-state small">Aucune notification.</p>'}
                </div>
                <div class="notification-footer">
                    ${notificationHasMore ? '<button class="notification-load-more" type="button" data-load-more><i class="fas fa-chevron-down"></i> Voir plus</button>' : ''}
                    ${notifications.some(notification => !notification.read_at) ? '<button class="notification-mark-all" data-mark-all-read><i class="fas fa-check-double"></i> Tout marquer comme lu</button>' : ''}
                </div>
            </div>`;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', close);
        const notificationList = modal.querySelector('.notification-list');
        const notificationFooter = modal.querySelector('.notification-footer');

        const refreshFooter = () => {
            if (!notificationFooter) return;
            notificationFooter.innerHTML = `
                ${notificationHasMore ? '<button class="notification-load-more" type="button" data-load-more><i class="fas fa-chevron-down"></i> Voir plus</button>' : ''}
                ${notifications.some(notification => !notification.read_at) ? '<button class="notification-mark-all" data-mark-all-read><i class="fas fa-check-double"></i> Tout marquer comme lu</button>' : ''}
            `;
        };

        const appendNotifications = (items) => {
            if (!items.length) return;
            items.forEach(notification => notificationMap.set(String(Number(notification.id)), notification));
            notificationList.insertAdjacentHTML('beforeend', items.map(renderNotificationItem).join(''));
        };

        modal.addEventListener('click', async event => {
            if (event.target === modal) close();

            if (event.target.closest('[data-load-more]')) {
                if (notificationLoading || !notificationHasMore) return;
                notificationLoading = true;
                const loadMoreButton = event.target.closest('[data-load-more]');
                loadMoreButton.disabled = true;
                loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
                try {
                    const next = await getNotifications(PAGE_SIZE, notificationOffset);
                    const nextNotifications = next.notifications || [];
                    appendNotifications(nextNotifications);
                    notificationOffset += nextNotifications.length;
                    notificationHasMore = nextNotifications.length === PAGE_SIZE;
                    notifications.push(...nextNotifications);
                    refreshFooter();
                } finally {
                    notificationLoading = false;
                }
                return;
            }

            const item = event.target.closest('[data-notification-id]');
            if (item) {
                const notificationId = Number(item.dataset.notificationId);
                const notification = notificationMap.get(String(notificationId));
                const wasUnread = item.classList.contains('unread');
                await markNotificationRead(notificationId);
                item.classList.remove('unread');
                if (wasUnread) {
                    updateNotificationBadge(Math.max(0, Number(response.unread_count || 0) - 1));
                }
                if (notification) {
                    handleNotificationRoute(notification);
                }
                close();
            }
            if (event.target.closest('[data-mark-all-read]')) {
                await markNotificationRead();
                updateNotificationBadge(0);
                modal.querySelectorAll('.notification-item').forEach(element => element.classList.remove('unread'));
                const markAllButton = event.target.closest('[data-mark-all-read]');
                if (markAllButton) markAllButton.remove();
            }
        });
    } catch (error) {
        showToast('Impossible de charger les notifications.', 'error');
    }
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

function bindHeaderActions() {
    const searchIconEl = document.getElementById('searchIcon');
    if (searchIconEl && !searchIconEl.dataset.boundHeaderSearch) {
        searchIconEl.dataset.boundHeaderSearch = 'true';
        searchIconEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const showAndFix = (wrap) => {
                wrap.classList.add('show');
                wrap.classList.add('fixed');
                const input = document.getElementById('feedSearchInput');
                if (input) input.focus();

                if (!window._feedSearchEscHandler) {
                    window._feedSearchEscHandler = function(ev) {
                        if (ev.key === 'Escape' || ev.keyCode === 27) {
                            const w = document.querySelector('.feed-search');
                            if (w && w.classList.contains('show')) {
                                w.classList.remove('show');
                                w.classList.remove('fixed');
                                const inp = document.getElementById('feedSearchInput');
                                if (inp) {
                                    inp.value = '';
                                    inp.blur();
                                }
                                const dist = parseInt(document.getElementById('distanceRange')?.value || 5);
                                if (typeof loadFeed === 'function') loadFeed(dist, '');
                            }
                        }
                    };
                    document.addEventListener('keydown', window._feedSearchEscHandler);
                }
            };

            if (currentPage !== 'feed') {
                navigateTo('feed');
                setTimeout(() => {
                    const wrap = document.querySelector('.feed-search');
                    if (wrap) showAndFix(wrap);
                }, 350);
                return;
            }

            const wrap = document.querySelector('.feed-search');
            if (!wrap) {
                navigateTo('feed');
                setTimeout(() => {
                    const w = document.querySelector('.feed-search');
                    if (w) showAndFix(w);
                }, 350);
                return;
            }

            const nowShown = wrap.classList.toggle('show');
            const input = document.getElementById('feedSearchInput');
            if (nowShown) {
                wrap.classList.add('fixed');
                if (input) input.focus();
                if (!window._feedSearchEscHandler) {
                    window._feedSearchEscHandler = function(ev) {
                        if (ev.key === 'Escape' || ev.keyCode === 27) {
                            const w = document.querySelector('.feed-search');
                            if (w && w.classList.contains('show')) {
                                w.classList.remove('show');
                                w.classList.remove('fixed');
                                const inp = document.getElementById('feedSearchInput');
                                if (inp) {
                                    inp.value = '';
                                    inp.blur();
                                }
                                const dist = parseInt(document.getElementById('distanceRange')?.value || 5);
                                if (typeof loadFeed === 'function') loadFeed(dist, '');
                            }
                        }
                    };
                    document.addEventListener('keydown', window._feedSearchEscHandler);
                }
            } else {
                wrap.classList.remove('fixed');
                if (input) input.value = '';
                const dist = parseInt(document.getElementById('distanceRange')?.value || 5);
                if (typeof loadFeed === 'function') loadFeed(dist, '');

                if (window._feedSearchEscHandler) {
                    document.removeEventListener('keydown', window._feedSearchEscHandler);
                    delete window._feedSearchEscHandler;
                }
            }
        });

        searchIconEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                searchIconEl.click();
            }
        });
    }

    const notificationTrigger = document.getElementById('notificationTrigger');
    if (notificationTrigger && !notificationTrigger.dataset.boundHeaderNotification) {
        notificationTrigger.dataset.boundHeaderNotification = 'true';
        notificationTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!CURRENT_USER || !CURRENT_USER.id) return;
            openNotifications();
        });
        notificationTrigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                if (!CURRENT_USER || !CURRENT_USER.id) return;
                openNotifications();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    attachNavigationHandlers();
    bindHeaderActions();

    let storedUser = loadStoredUser();
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
        try {
            const profileResponse = await getProfile();
            const user = profileResponse && profileResponse.user ? profileResponse.user : null;
            if (user) {
                storedUser = user;
                localStorage.setItem('ag7_current_user', JSON.stringify(user));
                if (typeof applyStoredUser === 'function') {
                    applyStoredUser(user);
                } else {
                    CURRENT_USER.id = user.id || CURRENT_USER.id;
                    CURRENT_USER.username = user.username || CURRENT_USER.username;
                    CURRENT_USER.points = user.points ?? CURRENT_USER.points;
                    CURRENT_USER.avatar = user.avatar || CURRENT_USER.avatar;
                    CURRENT_USER.shopId = user.shopId || null;
                    CURRENT_USER.role = user.role || CURRENT_USER.role;
                }
            } else {
                localStorage.removeItem('ag7_current_user');
                updateHeaderActionsVisibility();
                navigateTo('auth');
                return;
            }
        } catch (error) {
            localStorage.removeItem('ag7_current_user');
            updateHeaderActionsVisibility();
            navigateTo('auth');
            return;
        }
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

    bindHeaderActions();

    refreshNotificationBadge();
    window.clearInterval(window.notificationBadgeInterval);
    window.notificationBadgeInterval = window.setInterval(refreshNotificationBadge, 30000);

    // Service Worker pour le hors-ligne
    const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const secureContextAllowed = location.protocol === 'https:' && window.isSecureContext;
    const canRegisterSW = ('serviceWorker' in navigator) && (secureContextAllowed || (location.protocol === 'http:' && isLocalhost));
    if (canRegisterSW) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW enregistré'))
            .catch(err => {
                console.info('SW non enregistré en mode local sans certificat valide.');
            });
    } else if ('serviceWorker' in navigator) {
        console.info('SW non enregistré : certificat ou contexte de sécurité insuffisant.');
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
    const publicPages = ['auth', 'privacy', 'terms'];
    if (!publicPages.includes(page) && (!CURRENT_USER || !CURRENT_USER.id)) {
        page = 'auth';
    }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');

    currentPage = page;

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
        case 'privacy':
            renderPrivacyPolicy(container);
            break;
        case 'terms':
            renderTerms(container);
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
window.SHOPS = (typeof SHOPS !== 'undefined') ? SHOPS : [];
window.PRODUCTS = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
window.COLLECTIONS = (typeof COLLECTIONS !== 'undefined') ? COLLECTIONS : [];
window.CURRENT_USER = (typeof CURRENT_USER !== 'undefined') ? CURRENT_USER : { id: null, username: '', points: 0, avatar: '', shopId: null, role: 'buyer' };
window.FLASH_DEALS = (typeof FLASH_DEALS !== 'undefined') ? FLASH_DEALS : [];

// Helper to resolve product image URL from API fields
function getProductImage(product) {
    if (!product) return '';
    // Prefer explicit image_filename returned by API
    if (product.image_filename) {
        const base = (location.pathname.replace(/\/[^/]*$/, '')) || '';
        return base + '/backend/articles/' + product.image_filename;
    }
    // If product.image looks like an absolute URL or already a path, use it
    if (product.image) {
        try {
            if (product.image.startsWith('/') || product.image.startsWith('http') || product.image.startsWith('data:')) {
                // If path starts with '/' but doesn't include the app folder, adjust it
                if (product.image.startsWith('/') && !product.image.startsWith(location.pathname.replace(/\/[^/]*$/, ''))) {
                    const base = (location.pathname.replace(/\/[^/]*$/, '')) || '';
                    return base + product.image;
                }
                return product.image;
            }
            // Otherwise assume it's a filename stored in DB
            const base = (location.pathname.replace(/\/[^/]*$/, '')) || '';
            return base + '/backend/articles/' + product.image;
        } catch (e) {
            return product.image;
        }
    }
    return '';
}
window.getProductImage = getProductImage;