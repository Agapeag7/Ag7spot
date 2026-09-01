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

    if (CURRENT_USER && CURRENT_USER.id && !isAg7SpotTutorialDone()) {
        setTimeout(() => startAg7SpotTutorial(), 350);
    }

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

function getAg7SpotTutorialKey() {
    const userId = (window.CURRENT_USER && window.CURRENT_USER.id) ? String(window.CURRENT_USER.id) : null;
    return userId ? `ag7spot_tutorial_done_${userId}` : 'ag7spot_tutorial_done';
}

function isAg7SpotTutorialDone() {
    const key = getAg7SpotTutorialKey();
    return localStorage.getItem(key) === 'true';
}

function markAg7SpotTutorialDone() {
    localStorage.setItem(getAg7SpotTutorialKey(), 'true');
}

function getAg7SpotTutorialSteps() {
    return [
        {
            selector: '#searchIcon',
            title: 'Recherche',
            text: 'Rechercher rapidement un produit ou une boutique près de toi.'
        },
        {
            selector: '#notificationTrigger',
            title: 'Notifications',
            text: 'Regarde ici les nouveaux messages, mises à jour et alertes importantes.'
        },
        {
            selector: '.nav-item[data-page="map"]',
            title: 'Carte',
            text: 'Explore la carte pour voir les boutiques les plus proches de ta position.'
        },
        {
            selector: '#distanceRange',
            title: 'Distance',
            text: 'Ajuste la distance pour filtrer les offres à proximité.'
        },
        {
            selector: '#feedSearchInput',
            title: 'Recherche du fil',
            text: 'Utilise la recherche pour trouver un produit ou une boutique en particulier.'
        },
        {
            selector: '.nav-item.nav-center[data-page="add"]',
            title: 'Ajouter',
            text: 'Ajoute ici ta boutique ou un produit à vendre.'
        },
        {
            selector: '#routeBtn',
            title: 'Parcours',
            text: 'Crée un parcours pour organiser ta visite de plusieurs boutiques.'
        },
        {
            selector: '.nav-item[data-page="profile"]',
            title: 'Profil',
            text: 'Depuis ton profil, tu peux gérer tes produits, ton statut boutique et tes paramètres.'
        }
    ];
}

function startAg7SpotTutorial() {
    if (window.ag7SpotTutorialRunning) return;
    if (!CURRENT_USER || !CURRENT_USER.id) return;
    if (isAg7SpotTutorialDone()) return;

    const onboardingModal = document.getElementById('onboardingModal');
    if (onboardingModal && !onboardingModal.classList.contains('hidden')) {
        return;
    }

    const steps = getAg7SpotTutorialSteps();
    let currentStep = 0;

    const clearTutorialDom = () => {
        document.querySelectorAll('.ag7spot-tutorial-overlay, .ag7spot-tutorial-highlight').forEach(el => el.remove());
    };

    const closeTutorial = () => {
        clearTutorialDom();
        window.ag7SpotTutorialRunning = false;
        markAg7SpotTutorialDone();
    };

    const showStep = () => {
        clearTutorialDom();

        const step = steps[currentStep];
        if (!step) {
            closeTutorial();
            return;
        }

        const target = document.querySelector(step.selector);
        if (!target) {
            if (currentStep < steps.length - 1) {
                currentStep += 1;
                showStep();
                return;
            }
            closeTutorial();
            return;
        }

        const rect = target.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'ag7spot-tutorial-highlight';
        highlight.style.top = `${rect.top - 8}px`;
        highlight.style.left = `${rect.left - 8}px`;
        highlight.style.width = `${rect.width + 16}px`;
        highlight.style.height = `${rect.height + 16}px`;

        const backdrop = document.createElement('div');
        backdrop.className = 'ag7spot-tutorial-overlay';

        backdrop.innerHTML = `
            <div class="ag7spot-tutorial-card">
                <div class="ag7spot-tutorial-header">
                    <span class="ag7spot-tutorial-badge">${currentStep + 1}/${steps.length}</span>
                    <button type="button" class="ag7spot-tutorial-close" aria-label="Fermer le tutoriel">×</button>
                </div>
                <h3>${step.title}</h3>
                <p>${step.text}</p>
                <div class="ag7spot-tutorial-actions">
                    <button type="button" class="ag7spot-tutorial-btn ag7spot-tutorial-btn-secondary" data-action="skip">Passer</button>
                    <div class="ag7spot-tutorial-nav">
                        <button type="button" class="ag7spot-tutorial-btn ag7spot-tutorial-btn-muted" data-action="prev" ${currentStep === 0 ? 'disabled' : ''}>Retour</button>
                        <button type="button" class="ag7spot-tutorial-btn ag7spot-tutorial-btn-primary" data-action="next">${currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</button>
                    </div>
                </div>
            </div>
        `;

        const tutorialCard = backdrop.querySelector('.ag7spot-tutorial-card');
        if (tutorialCard) {
            const cardWidth = 360;
            const padding = 18;
            const cardHeight = 220;
            const targetCenterX = rect.left + rect.width / 2;
            const targetCenterY = rect.top + rect.height / 2;
            const minCardLeft = padding;
            const maxCardLeft = window.innerWidth - cardWidth - padding;

            const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

            let cardLeft = clamp(targetCenterX - cardWidth / 2, minCardLeft, maxCardLeft);
            let cardTop = rect.bottom + 22;
            let arrowSide = 'top';

            const enoughSpaceRight = window.innerWidth - rect.right - padding > cardWidth + 28;
            const enoughSpaceLeft = rect.left - padding > cardWidth + 28;
            const enoughSpaceBottom = window.innerHeight - rect.bottom - padding > cardHeight + 26;
            const enoughSpaceTop = rect.top - padding > cardHeight + 26;

            if (targetCenterX > window.innerWidth * 0.62 && enoughSpaceLeft) {
                arrowSide = 'right';
                cardLeft = rect.left - cardWidth - 22;
                cardTop = clamp(targetCenterY - cardHeight / 2, padding, window.innerHeight - cardHeight - padding);
            } else if (targetCenterX < window.innerWidth * 0.38 && enoughSpaceRight) {
                arrowSide = 'left';
                cardLeft = rect.right + 22;
                cardTop = clamp(targetCenterY - cardHeight / 2, padding, window.innerHeight - cardHeight - padding);
            } else if (enoughSpaceBottom) {
                arrowSide = 'top';
                cardLeft = clamp(targetCenterX - cardWidth / 2, minCardLeft, maxCardLeft);
                cardTop = rect.bottom + 22;
            } else if (enoughSpaceTop) {
                arrowSide = 'bottom';
                cardLeft = clamp(targetCenterX - cardWidth / 2, minCardLeft, maxCardLeft);
                cardTop = rect.top - cardHeight - 22;
            } else {
                arrowSide = 'top';
                cardLeft = clamp(targetCenterX - cardWidth / 2, minCardLeft, maxCardLeft);
                cardTop = clamp(rect.bottom + 22, padding, window.innerHeight - cardHeight - padding);
            }

            tutorialCard.style.position = 'absolute';
            tutorialCard.style.left = `${cardLeft}px`;
            tutorialCard.style.top = `${cardTop}px`;

            const arrow = document.createElement('div');
            arrow.className = `ag7spot-tutorial-arrow ag7spot-tutorial-arrow-${arrowSide}`;

            if (arrowSide === 'left') {
                arrow.style.top = `${clamp(targetCenterY - cardTop - 8, 18, cardHeight - 18)}px`;
                arrow.style.left = '-7px';
            } else if (arrowSide === 'right') {
                arrow.style.top = `${clamp(targetCenterY - cardTop - 8, 18, cardHeight - 18)}px`;
                arrow.style.right = '-7px';
            } else if (arrowSide === 'top') {
                arrow.style.left = `${clamp(targetCenterX - cardLeft - 8, 18, cardWidth - 18)}px`;
                arrow.style.top = '-7px';
            } else if (arrowSide === 'bottom') {
                arrow.style.left = `${clamp(targetCenterX - cardLeft - 8, 18, cardWidth - 18)}px`;
                arrow.style.bottom = '-7px';
            }

            tutorialCard.appendChild(arrow);
        }

        const closeButton = backdrop.querySelector('.ag7spot-tutorial-close');
        closeButton.addEventListener('click', closeTutorial);

        backdrop.querySelector('[data-action="skip"]').addEventListener('click', closeTutorial);
        backdrop.querySelector('[data-action="prev"]').addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep -= 1;
                showStep();
            }
        });
        backdrop.querySelector('[data-action="next"]').addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                currentStep += 1;
                showStep();
            } else {
                closeTutorial();
            }
        });

        document.body.appendChild(highlight);
        document.body.appendChild(backdrop);
        window.ag7SpotTutorialRunning = true;
    };

    showStep();
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