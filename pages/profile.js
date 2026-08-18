// =========================================
// PAGE : PROFIL UTILISATEUR
// =========================================
async function renderProfile(container) {
    // console.debug('renderProfile: start', { CURRENT_USER });
    container.innerHTML = `
        <div class="page active">
            <div class="loading-state">
                <p>Chargement du profil...</p>
            </div>
        </div>
    `;

    try {
        const data = await getProfile();
        // console.debug('renderProfile: api data', data);
        const user = data.user || CURRENT_USER;
        const myShop = user.role === 'seller' ? (data.shop || null) : null;
        const isSellerWithShop = user.role === 'seller' && !!myShop;
        const isSellerWithoutShop = user.role === 'seller' && !myShop;
        const products = data.products || [];
        const followCount = data.followCount ?? 0;
        const roleLabel = user.role === 'seller' ? 'Vendeur' : 'Acheteur';

        container.innerHTML = `
            <div class="page active">
                <div class="profile-card">
                    <div class="avatar">${user.avatar || user.username.charAt(0).toUpperCase()}</div>
                    <h3>${user.username}</h3>
                    <p class="profile-role">${roleLabel}</p>
                    <div class="profile-stats">
                        <div><strong>${followCount}</strong> <span>Abonnements</span></div>
                        ${user.role === 'seller' ? `<div><strong>${products.length}</strong> <span>Mes produits</span></div>` : ''}
                        <div><strong>${user.points}</strong> <span>Points</span></div>
                    </div>
                    <button class="btn-outline profile-edit-btn" onclick="showProfileEditor()">
                        <i class="fas fa-edit"></i> Modifier le profil
                    </button>
                </div>

                ${user.role === 'seller' ? `
                    <div class="settings-card">
                        <h4><i class="fas fa-store"></i> Ma boutique</h4>
                        ${isSellerWithShop ? `
                            <div class="settings-item">
                                <span>${myShop.name}</span>
                                <span class="settings-value">${renderShopStatus(myShop)}</span>
                            </div>
                            <div class="settings-item" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                                <span>Statut</span>
                                <span class="settings-value">${renderShopStatus(myShop)}</span>
                            </div>
                            <div class="settings-item">
                                <span>Adresse</span>
                                <span class="settings-value">${myShop.address}</span>
                            </div>
                            <div class="settings-item" style="display:block;">
                                <span>Statut boutique</span>
                                <div class="shop-status-toggle-group" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
                                    <button class="shop-status-toggle ${myShop.status === 'open' ? 'active' : ''}" data-status="open" aria-pressed="${myShop.status === 'open'}" onclick="handleSellerShopStatusChange('open')">
                                        <i class="fas fa-door-open"></i> Ouverte
                                    </button>
                                    <button class="shop-status-toggle ${myShop.status === 'closed' ? 'active' : ''}" data-status="closed" aria-pressed="${myShop.status === 'closed'}" onclick="handleSellerShopStatusChange('closed')">
                                        <i class="fas fa-door-closed"></i> Fermée
                                    </button>
                                    <button class="shop-status-toggle ${myShop.status === 'break' ? 'active' : ''}" data-status="break" aria-pressed="${myShop.status === 'break'}" onclick="handleSellerShopStatusChange('break')">
                                        <i class="fas fa-mug-hot"></i> Pause
                                    </button>
                                </div>
                            </div>
                            <button class="btn-primary w-full" onclick="navigateTo('add')">
                                <i class="fas fa-plus-circle"></i> Ajouter un produit
                            </button>
                        ` : `
                            <p>Tu n'as pas encore de boutique. Crée-la pour vendre dans l'application.</p>
                            <button class="btn-primary w-full" onclick="navigateToAddShop()">
                                <i class="fas fa-store"></i> Créer ma boutique
                            </button>
                        `}
                    </div>
                ` : ''}

                ${user.role === 'seller' && myShop ? `
                    <div class="settings-card">
                            <div class="section-title">
                                <span><i class="fas fa-box-open"></i> Produits déjà ajoutés</span>
                                <a href="#" onclick="renderProfile(document.getElementById('pageContainer'))">Actualiser</a>
                            </div>
                            <div id="sellerProductsList" class="seller-products-list">
                                <div id="sellerProductsContainer" class="seller-products-container"></div>
                                <div id="sellerProductsBatchSpinner" class="feed-batch-spinner hidden"><div class="spinner small"></div></div>
                            </div>
                        </div>
                ` : ''}

                <div class="settings-card">
                    <h4><i class="fas fa-cog"></i> Paramètres</h4>
                    <div class="settings-item">
                        <span>Notifications push</span>
                        <span class="settings-value">Activées</span>
                    </div>
                    <div class="settings-item">
                        <span>Mode sombre</span>
                        <span class="settings-value">Désactivé</span>
                    </div>
                    <div class="settings-item">
                        <span>Mode hors-ligne</span>
                    </div>
                    <button class="btn-outline w-full" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Se déconnecter
                    </button>
                </div>
            </div>
        `;

        Object.assign(CURRENT_USER || window.CURRENT_USER || {}, user);
        localStorage.setItem('ag7_current_user', JSON.stringify(CURRENT_USER || window.CURRENT_USER));
        // init seller products pagination if seller
        if (user.role === 'seller' && myShop) {
            // products variable from API response
            try { initSellerProducts(products || [], myShop); } catch (e) { console.warn('initSellerProducts error', e); }
        }
    } catch (error) {
        // console.error('renderProfile: error', error);
        // If a session-clearing/navigation to auth is already in progress (API returned 401),
        // avoid rendering the error page which would briefly show an unauthorized message.
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) {
            return;
        }
        showToast(error.message || 'Impossible de charger le profil.', 'error');
        container.innerHTML = `
            <div class="page active">
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Impossible de charger le profil. ${error.message ? '(' + error.message + ')' : ''}</p>
                </div>
            </div>
        `;
    }
}

async function handleSellerShopStatusChange(status) {
    try {
        const shopId = CURRENT_USER?.shopId || sellerProductsState?.myShop?.id || null;
        if (!shopId) {
            showToast('Aucune boutique associée à ton profil.', 'warning');
            return;
        }

        const result = await updateShopStatus(shopId, status);
        if (result && result.success) {
            const shop = SHOPS.find(s => s.id === shopId);
            if (shop) {
                shop.status = status;
            }
            const currentContainer = document.getElementById('pageContainer');
            if (currentContainer) {
                await renderProfile(currentContainer);
            }
            const label = status === 'open' ? 'ouverte' : status === 'closed' ? 'fermée' : 'en pause';
            showToast(`Boutique ${label}`, 'success');
            return;
        }

        showToast('Impossible de modifier le statut de la boutique.', 'error');
    } catch (error) {
        console.error('handleSellerShopStatusChange error', error);
        showToast('Erreur lors du changement de statut.', 'error');
    }
}

function renderSellerProducts(products, myShop) {
    if (!products || products.length === 0) {
        return `
            <div class="empty-state small">
                <i class="fas fa-box"></i>
                <p>Aucun produit ajouté pour le moment. Publie ton premier produit ici.</p>
            </div>
        `;
    }

    return products.map(product => {
        return `
            <div class="seller-product-item">
                <div class="seller-product-thumbnail">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy" />
                </div>
                <div class="seller-product-info">
                    <strong>${product.name}</strong>
                    <p>${myShop.name} · ${product.stock} en stock</p>
                    <p class="price">${parseFloat(product.price).toFixed(2)} $</p>
                </div>
                <div class="seller-product-actions">
                    <button class="btn-outline btn-sm" onclick="event.stopPropagation(); editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-outline btn-sm delete" onclick="event.stopPropagation(); deleteProductAction(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Pagination state for seller products
const sellerProductsState = {
    allItems: [],
    displayedCount: 0,
    pageSize: 5,
    loading: false,
    end: false,
    myShop: null
};

function initSellerProducts(products, myShop) {
    sellerProductsState.allItems = products || [];
    sellerProductsState.displayedCount = 0;
    sellerProductsState.loading = false;
    sellerProductsState.end = false;
    sellerProductsState.myShop = myShop || null;

    const container = document.getElementById('sellerProductsContainer');
    if (!container) return;
    container.innerHTML = '';

    // attach scroll handler to container
    const listWrap = document.getElementById('sellerProductsList');
    if (listWrap) {
        if (window._sellerProductsScrollHandler) listWrap.removeEventListener('scroll', window._sellerProductsScrollHandler);
        window._sellerProductsScrollHandler = function() {
            if (sellerProductsState.loading || sellerProductsState.end) return;
            const elem = listWrap.querySelector('.seller-products-container');
            if (!elem) return;
            const bottomDistance = elem.scrollHeight - elem.scrollTop - elem.clientHeight;
            if (bottomDistance < 120) {
                renderSellerProductsBatch();
            }
        };
        listWrap.addEventListener('scroll', window._sellerProductsScrollHandler);
    }

    renderSellerProductsBatch();
}

function renderSellerProductsBatch() {
    const container = document.getElementById('sellerProductsContainer');
    if (!container) return;
    if (sellerProductsState.loading && sellerProductsState.displayedCount > 0) return;
    sellerProductsState.loading = true;
    try { document.getElementById('sellerProductsBatchSpinner')?.classList.remove('hidden'); } catch(e){}

    const start = sellerProductsState.displayedCount;
    const end = Math.min(start + sellerProductsState.pageSize, sellerProductsState.allItems.length);
    const slice = sellerProductsState.allItems.slice(start, end);

    const html = slice.map(product => {
        const shopName = sellerProductsState.myShop ? sellerProductsState.myShop.name : (SHOPS.find(s => s.id === product.shopId)?.name || 'Boutique');
        return `
            <div class="seller-product-item">
                <div class="seller-product-thumbnail">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy" />
                </div>
                <div class="seller-product-info">
                    <strong>${product.name}</strong>
                    <p>${shopName} · ${product.stock} en stock</p>
                    <p class="price">${parseFloat(product.price).toFixed(2)} $</p>
                </div>
                <div class="seller-product-actions">
                    <button class="btn-outline btn-sm" onclick="event.stopPropagation(); editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-outline btn-sm delete" onclick="event.stopPropagation(); deleteProductAction(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.insertAdjacentHTML('beforeend', html);
    sellerProductsState.displayedCount = end;
    sellerProductsState.loading = false;
    try { document.getElementById('sellerProductsBatchSpinner')?.classList.add('hidden'); } catch(e){}

    if (sellerProductsState.displayedCount >= sellerProductsState.allItems.length) {
        sellerProductsState.end = true;
        container.insertAdjacentHTML('beforeend', `<div class="end-of-feed" style="text-align:center;color:#6B7280;padding:12px 0;">Fin des produits</div>`);
    }
}

function showProfileEditor() {
    const username = prompt('Nom d\'utilisateur', CURRENT_USER.username);
    if (username === null) return;

    const email = prompt('Adresse e-mail', CURRENT_USER.email || '');
    if (email === null) return;

    updateProfile(username.trim(), email.trim());
}

async function updateProfile(username, email) {
    if (!username || !email) {
        showToast('Nom et e-mail sont requis.', 'warning');
        return;
    }

    try {
        const response = await apiCall('profile.php', 'PUT', { username, email });
        if (response.success && response.user) {
            Object.assign(CURRENT_USER || window.CURRENT_USER || {}, response.user);
            localStorage.setItem('ag7_current_user', JSON.stringify(CURRENT_USER || window.CURRENT_USER));
            showToast('Profil mis à jour.', 'success');
            renderProfile(document.getElementById('pageContainer'));
        }
    } catch (error) {
        // showToast already handled
    }
}

function preloadOfflineMap() {
    showToast('Téléchargement de la carte en cours...', 'info');
    getUserPosition().then(pos => {
        setTimeout(() => {
            showToast('Carte téléchargée pour le hors-ligne', 'success');
            localStorage.setItem('offline_map_downloaded', 'true');
        }, 2000);
    });
}

