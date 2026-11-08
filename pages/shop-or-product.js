// =========================================
// PAGE : AJOUTER UN PRODUIT / CRÉER MA BOUTIQUE
// =========================================
async function renderShopOrProduct(container) {
    // Refresh profile/shop info to ensure we render correct UI after role/login changes
    if (CURRENT_USER && CURRENT_USER.id) {
        try {
            const profileData = await getProfile();
            if (profileData && profileData.user) {
                Object.assign(CURRENT_USER, profileData.user);
                localStorage.setItem('ag7_current_user', JSON.stringify(CURRENT_USER));
            }
            if (profileData && profileData.shop) {
                const shop = profileData.shop;
                const existing = SHOPS.findIndex(s => s.id === shop.id);
                if (existing > -1) {
                    SHOPS[existing] = shop;
                } else {
                    SHOPS.push(shop);
                }
                CURRENT_USER.shopId = shop.id;
            }
        } catch (e) {
            console.debug('renderShopOrProduct: profile fetch failed', e);
        }
    }

    if (!CURRENT_USER || CURRENT_USER.role !== 'seller') {
        container.innerHTML = `
            <div class="page active">
                <div class="empty-state">
                    <i class="fas fa-lock"></i>
                    <h3>Accès réservé aux vendeurs</h3>
                    <p>Les produits ne peuvent être ajoutés que par des vendeurs possédant une boutique.</p>
                    <button class="btn-primary btn-sm" onclick="navigateTo('profile')">Retour au profil</button>
                </div>
            </div>
        `;
        return;
    }

    const ownedShops = SHOPS.filter(shop => shop.ownerId === CURRENT_USER.id);
    // Consider the user as having a shop if `CURRENT_USER.shopId` is set (authoritative),
    // or if we find owned shops in the in-memory list. This prevents showing the
    // shop-creation UI when the global `SHOPS` hasn't been populated yet.
    const hasShop = (!!CURRENT_USER && !!CURRENT_USER.shopId) || ownedShops.length > 0;
    const forceShopCreation = !!window.forceShopCreation;
    const showShopCreation = !hasShop || forceShopCreation;

    if (showShopCreation) {
        container.innerHTML = `
            <div class="page active">
                <h2 class="section-title"><i class="fas fa-shopping-bag"></i> Créer ma boutique</h2>
                <div class="form-card">
                    <p>Tu n'as pas encore de boutique. Crée-la pour vendre dans l'application et apparaître sur la carte.</p>
                    <form id="createShopForm">
                        <div class="form-group">
                            <label>Nom de la boutique</label>
                            <input type="text" id="shopName" placeholder="Ex: Ma boutique locale" required />
                        </div>
                        <div class="form-group">
                            <label>Catégorie</label>
                            <select id="shopCategory" required>
                                <option value="" disabled selected>Choisis une catégorie</option>
                                <option value="fashion">Mode et habillement</option>
                                <option value="home">Maison et décoration</option>
                                <option value="tech">High-tech et électronique</option>
                                <option value="food">Alimentation et boissons</option>
                                <option value="sports">Sports et loisirs</option>
                                <option value="beauty">Santé et beauté</option>
                                <option value="books">Livres et papeterie</option>
                                <option value="toys">Jouets et jeux</option>
                                <option value="other">Autres</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Position sur la carte</label>
                            <div id="shopCreateMap" class="shop-create-map"></div>
                            <p class="map-hint">Déplace le marqueur pour choisir l'emplacement précis de la boutique.</p>
                            <input type="hidden" id="shopLat" />
                            <input type="hidden" id="shopLng" />
                        </div>
                        <button type="submit" class="btn-primary w-full">
                            <i class="fas fa-store"></i> Créer ma boutique
                        </button>
                    </form>
                </div>
            </div>
        `;
        setupShopForm();
    } else {
        container.innerHTML = `
            <div class="page active">
                <h2 class="section-title"><i class="fas fa-shopping-bag"></i> Ajouter un produit</h2>
                <div class="form-card">
                    <form id="addProductForm">
                        <fieldset class="product-image-mode">
                            <legend>Comment veux-tu ajouter les produits ?</legend>
                            <label class="checkbox-label">
                                <input type="radio" name="productImageMode" value="individual" checked />
                                <span>Une fiche et une image par produit</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="radio" name="productImageMode" value="shared" />
                                <span>Plusieurs images avec le même nom, prix et description</span>
                            </label>
                        </fieldset>
                        <div id="individualProducts">
                            <div class="product-list-header">
                                <strong>Produits à publier</strong>
                                <button type="button" class="btn-outline btn-sm" id="addProductEntry">
                                    <i class="fas fa-plus"></i> Ajouter un produit
                                </button>
                            </div>
                            <div id="productEntries" class="product-entries">
                                <div class="product-entry" data-product-entry>
                                    <div class="product-entry-heading">
                                        <strong>Produit 1</strong>
                                        <button type="button" class="product-entry-remove" data-remove-product aria-label="Supprimer ce produit" title="Supprimer ce produit">
                                            <i class="fas fa-trash" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <div class="form-group">
                                        <label>Nom du produit</label>
                                        <input type="text" class="product-name" placeholder="Ex: Sweat à capuche oversize" required />
                                    </div>
                                    <div class="form-group">
                                        <label>Prix ($)</label>
                                        <input type="number" class="product-price" placeholder="49.99" min="0.01" step="0.01" required />
                                    </div>
                                    <div class="form-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" class="product-show-price" checked />
                                            <span>Afficher le prix aux clients</span>
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>Description (facultatif)</label>
                                        <textarea class="product-description" placeholder="Taille, matière, couleur..."></textarea>
                                    </div>
                                    <div class="form-group product-image-field">
                                        <label>Image de ce produit (facultatif)</label>
                                        <div class="image-upload">
                                            <img class="preview-img" alt="Aperçu de l'image du produit" />
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <span data-image-label>Cliquez pour choisir une image</span>
                                            <input type="file" class="product-image-input" accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="sharedProducts" hidden>
                            <div class="form-group">
                                <label for="sharedProductName">Nom du produit</label>
                                <input type="text" id="sharedProductName" placeholder="Ex: T-shirt coton" required />
                            </div>
                            <div class="form-group">
                                <label for="sharedProductPrice">Prix ($)</label>
                                <input type="number" id="sharedProductPrice" placeholder="15.00" min="0.01" step="0.01" required />
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="sharedProductShowPrice" checked />
                                    <span>Afficher le prix aux clients</span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="sharedProductDescription">Description (facultatif)</label>
                                <textarea id="sharedProductDescription" placeholder="Taille, matière, couleur..."></textarea>
                            </div>
                            <div class="form-group product-image-field">
                                <label>Images du produit (sélectionne une ou plusieurs images)</label>
                                <div class="image-upload">
                                    <img class="preview-img" alt="Aperçu des images sélectionnées" />
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span data-image-label>Cliquez pour choisir plusieurs images</span>
                                    <input type="file" id="sharedProductImages" accept="image/*" multiple />
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Ma boutique</label>
                            <select id="productShop">
                                ${ownedShops.map(shop => `<option value="${shop.id}">${shop.name}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="btn-primary w-full" id="addProductsSubmit">
                            <i class="fas fa-plus-circle"></i> Publier le produit
                        </button>
                    </form>
                </div>
            </div>
        `;
        setupProductForm();
    }

    window.forceShopCreation = false;
}

function renderSellerProducts(shopIds) {
    const sellerProducts = PRODUCTS.filter(product => shopIds.includes(product.shopId));
    if (sellerProducts.length === 0) {
        return `
            <div class="empty-state small">
                <i class="fas fa-box"></i>
                <p>Aucun produit ajouté pour le moment. Publie ton premier produit ici.</p>
            </div>
        `;
    }

    return sellerProducts.map(product => {
        const shop = SHOPS.find(s => s.id === product.shopId) || { name: 'Boutique inconnue' };
        return `
            <div class="seller-product-item">
                <div class="seller-product-thumbnail">
                    <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy" />
                </div>
                <div class="seller-product-info">
                    <strong>${product.name}</strong>
                    <p>${shop.name}</p>
                    <p class="price">${product.price.toFixed(2)} $</p>
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

async function editProduct(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const shop = SHOPS.find(s => s.id === product.shopId);
    if (!CURRENT_USER || CURRENT_USER.role !== 'seller' || !shop || shop.ownerId !== CURRENT_USER.id) {
        showToast('Tu ne peux modifier que tes propres produits.', 'warning');
        return;
    }

    const name = prompt('Modifier le nom du produit', product.name);
    if (name === null) return;
    const priceValue = prompt('Modifier le prix ($)', product.price);
    if (priceValue === null) return;

    const price = parseFloat(priceValue);
    if (!name.trim() || Number.isNaN(price)) {
        showToast('Valeurs invalides.', 'warning');
        return;
    }

    try {
        const success = await updateProduct(productId, {
            name: name.trim(),
            price,
            stock: Number(product.stock) || 0,
            description: product.description || '',
            image: product.image || ''
        });

        if (success) {
            product.name = name.trim();
            product.price = price;
            showToast('Produit mis à jour.', 'success');
            renderProfile(document.getElementById('pageContainer'));
        } else {
            throw new Error('Échec mise à jour produit');
        }
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        showToast('Erreur lors de la mise à jour du produit.', 'error');
    }
}

async function deleteProductAction(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const shop = SHOPS.find(s => s.id === product.shopId);
    if (!CURRENT_USER || CURRENT_USER.role !== 'seller' || !shop || shop.ownerId !== CURRENT_USER.id) {
        showToast('Tu ne peux supprimer que tes propres produits.', 'warning');
        return;
    }

    const confirmed = confirm(`Supprimer le produit « ${product.name} » ?`);
    if (!confirmed) return;

    try {
        const success = await deleteProduct(productId);
        if (success) {
            const index = PRODUCTS.findIndex(p => p.id === productId);
            if (index !== -1) PRODUCTS.splice(index, 1);
            showToast('Produit supprimé.', 'success');
            renderProfile(document.getElementById('pageContainer'));
        } else {
            throw new Error('Échec suppression produit');
        }
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        showToast('Erreur lors de la suppression du produit.', 'error');
    }
}

function setupProductForm() {
    const form = document.getElementById('addProductForm');
    const individualProducts = document.getElementById('individualProducts');
    const sharedProducts = document.getElementById('sharedProducts');
    const sharedProductImages = document.getElementById('sharedProductImages');
    const productEntries = document.getElementById('productEntries');
    const submitButton = document.getElementById('addProductsSubmit');
    const addProductEntryButton = document.getElementById('addProductEntry');
    const initialSubmitLabel = submitButton.innerHTML;
    let productFormSubmitting = false;
    let sharedImageMode = false;

    const updateImageMode = () => {
        sharedImageMode = form.querySelector('input[name="productImageMode"]:checked').value === 'shared';
        form.querySelectorAll('input[name="productImageMode"]').forEach(input => {
            input.disabled = productFormSubmitting;
        });
        individualProducts.hidden = sharedImageMode;
        sharedProducts.hidden = !sharedImageMode;
        individualProducts.querySelectorAll('input, textarea, button').forEach(control => {
            control.disabled = sharedImageMode || productFormSubmitting;
        });
        sharedProducts.querySelectorAll('input, textarea').forEach(control => {
            control.disabled = !sharedImageMode || productFormSubmitting;
        });
        addProductEntryButton.disabled = sharedImageMode || productFormSubmitting;
    };

    const updateProductEntryLabels = () => {
        const entries = productEntries.querySelectorAll('[data-product-entry]');
        entries.forEach((entry, index) => {
            entry.querySelector('.product-entry-heading strong').textContent = `Produit ${index + 1}`;
            entry.querySelector('[data-remove-product]').disabled = productFormSubmitting || entries.length === 1;
        });
        addProductEntryButton.disabled = sharedImageMode || productFormSubmitting;
    };

    form.querySelectorAll('input[name="productImageMode"]').forEach(input => {
        input.addEventListener('change', () => {
            updateImageMode();
            updateProductEntryLabels();
        });
    });

    addProductEntryButton.addEventListener('click', () => {
        const entry = document.createElement('div');
        entry.className = 'product-entry';
        entry.dataset.productEntry = '';
        entry.innerHTML = `
            <div class="product-entry-heading">
                <strong></strong>
                <button type="button" class="product-entry-remove" data-remove-product aria-label="Supprimer ce produit" title="Supprimer ce produit">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Nom du produit</label>
                <input type="text" class="product-name" placeholder="Ex: Sweat à capuche oversize" required />
            </div>
            <div class="form-group">
                <label>Prix ($)</label>
                <input type="number" class="product-price" placeholder="49.99" min="0.01" step="0.01" required />
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="product-show-price" checked />
                    <span>Afficher le prix aux clients</span>
                </label>
            </div>
            <div class="form-group">
                <label>Description (facultatif)</label>
                <textarea class="product-description" placeholder="Taille, matière, couleur..."></textarea>
            </div>
            <div class="form-group product-image-field">
                <label>Image de ce produit (facultatif)</label>
                <div class="image-upload">
                    <img class="preview-img" alt="Aperçu de l'image du produit" />
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span data-image-label>Cliquez pour choisir une image</span>
                    <input type="file" class="product-image-input" accept="image/*" />
                </div>
            </div>
        `;
        productEntries.appendChild(entry);
        updateProductEntryLabels();
        entry.querySelector('.product-name').focus();
    });

    productEntries.addEventListener('click', event => {
        const removeButton = event.target.closest('[data-remove-product]');
        if (!removeButton || productEntries.querySelectorAll('[data-product-entry]').length === 1) return;
        removeButton.closest('[data-product-entry]').remove();
        updateProductEntryLabels();
    });
    updateProductEntryLabels();

    // Compute owned shops locally from global SHOPS to avoid referencing outer-scope var
    const ownedShopsLocal = (Array.isArray(window.SHOPS) ? window.SHOPS : []).filter(shop => shop.ownerId === (CURRENT_USER && CURRENT_USER.id));
    const productShopSelect = document.getElementById('productShop');
    (async function populateShopSelect() {
        if (!productShopSelect) return;

        if (ownedShopsLocal.length > 0) {
            productShopSelect.innerHTML = ownedShopsLocal.map(shop => `<option value="${shop.id}">${shop.name}</option>`).join('');
            return;
        }

        // If CURRENT_USER has shopId, fetch profile to get shop info
        const uid = (CURRENT_USER && CURRENT_USER.shopId) ? CURRENT_USER.shopId : null;
        if (uid) {
            try {
                const profileData = await getProfile();
                const shop = profileData.shop || null;
                if (shop && shop.id) {
                    productShopSelect.innerHTML = `<option value="${shop.id}">${shop.name}</option>`;
                    return;
                }
            } catch (e) {
                if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
                console.warn('populateShopSelect: failed to fetch profile', e);
            }
        }

        // Fallback: no shops available
        productShopSelect.innerHTML = `<option value="">-- Aucune boutique trouvée --</option>`;
    })();

    updateImageMode();

    const updateImagePreview = input => {
        const uploadArea = input.closest('.image-upload');
        const preview = uploadArea.querySelector('.preview-img');
        const label = uploadArea.querySelector('[data-image-label]');
        const files = Array.from(input.files || []);
        const previousPreviewUrl = uploadArea.dataset.previewUrl;
        if (previousPreviewUrl) URL.revokeObjectURL(previousPreviewUrl);

        uploadArea.classList.toggle('has-image', files.length > 0);
        if (!files.length) {
            preview.removeAttribute('src');
            uploadArea.dataset.previewUrl = '';
            label.textContent = input.multiple ? 'Cliquez pour choisir plusieurs images' : 'Cliquez pour choisir une image';
            return;
        }

        const previewUrl = URL.createObjectURL(files[0]);
        uploadArea.dataset.previewUrl = previewUrl;
        preview.src = previewUrl;
        label.textContent = input.multiple
            ? `${files.length} image${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''}`
            : files[0].name;
    };

    form.addEventListener('click', event => {
        const uploadArea = event.target.closest('.image-upload');
        if (uploadArea && !event.target.matches('input[type="file"]')) {
            uploadArea.querySelector('input[type="file"]').click();
        }
    });
    form.addEventListener('change', event => {
        if (event.target.matches('.product-image-input, #sharedProductImages')) {
            updateImagePreview(event.target);
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (submitButton.disabled) return;

        const entries = Array.from(productEntries.querySelectorAll('[data-product-entry]'));
        const sharedFiles = Array.from(sharedProductImages.files || []);
        const productsToAdd = sharedImageMode
            ? sharedFiles.map(imageFile => ({
                entry: null,
                imageFile,
                name: document.getElementById('sharedProductName').value.trim(),
                price: parseFloat(document.getElementById('sharedProductPrice').value),
                description: document.getElementById('sharedProductDescription').value.trim(),
                showPrice: document.getElementById('sharedProductShowPrice').checked
            }))
            : entries.map(entry => ({
                entry,
                imageFile: entry.querySelector('.product-image-input').files[0] || null,
                name: entry.querySelector('.product-name').value.trim(),
                price: parseFloat(entry.querySelector('.product-price').value),
                description: entry.querySelector('.product-description').value.trim(),
                showPrice: entry.querySelector('.product-show-price').checked
            }));
        let shopId = parseInt(document.getElementById('productShop').value, 10);
        if (!Number.isFinite(shopId)) {
            // fallback to CURRENT_USER.shopId or first owned shop
            shopId = (CURRENT_USER && CURRENT_USER.shopId) ? CURRENT_USER.shopId : (ownedShopsLocal[0] ? ownedShopsLocal[0].id : 0);
        }
        const stock = 0;

        if (!productsToAdd.length || productsToAdd.some(product => !product.name || !Number.isFinite(product.price) || product.price <= 0)) {
            showToast(sharedImageMode
                ? 'Indiquez un nom, un prix supérieur à zéro et au moins une image.'
                : 'Indiquez un nom et un prix supérieur à zéro pour chaque produit.', 'warning');
            return;
        }

        const savedEntries = [];
        const savedFiles = [];
        const failedProducts = [];
        let savedCount = 0;
        let failedCount = 0;
        productFormSubmitting = true;
        updateImageMode();
        updateProductEntryLabels();
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Publication en cours...';
        try {
            for (const [index, product] of productsToAdd.entries()) {
                const formData = new FormData();
                formData.append('shop_id', shopId);
                formData.append('name', product.name);
                formData.append('price', product.price);
                formData.append('stock', stock);
                formData.append('description', product.description);
                formData.append('show_price', product.showPrice ? '1' : '0');
                if (product.imageFile) {
                    formData.append('image', product.imageFile);
                } else {
                    formData.append('image', `https://picsum.photos/seed/${Date.now()}-${index}/400/400`);
                }

                try {
                    const res = await addProduct(formData);
                    const productId = res && res.product_id ? res.product_id : null;
                    if (!productId) throw new Error('Erreur création produit');
                    const imageUrl = (res && (res.image_url || res.image)) || formData.get('image') || '';
                    PRODUCTS.push({
                        id: productId,
                        shopId,
                        name: product.name,
                        price: product.price,
                        stock,
                        description: product.description,
                        show_price: product.showPrice ? 1 : 0,
                        image: imageUrl,
                        distance: 0
                    });
                    savedCount++;
                    if (product.entry) savedEntries.push(product.entry);
                    if (product.imageFile) savedFiles.push(product.imageFile);
                } catch (error) {
                    if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
                    failedCount++;
                    failedProducts.push(product);
                    console.error('Erreur lors de la publication d’un produit.', error);
                }
            }

            if (failedCount === 0) {
                showToast(`${savedCount} produit${savedCount > 1 ? 's' : ''} ajouté${savedCount > 1 ? 's' : ''} avec succès !`, 'success');
                renderShopOrProduct(document.getElementById('pageContainer'));
            } else {
                savedEntries.forEach(entry => entry.remove());
                if (sharedImageMode && savedFiles.length) {
                    const retryFiles = new DataTransfer();
                    failedProducts.forEach(product => retryFiles.items.add(product.imageFile));
                    sharedProductImages.files = retryFiles.files;
                    updateImagePreview(sharedProductImages);
                }
                updateProductEntryLabels();
                showToast(`${savedCount} produit${savedCount > 1 ? 's' : ''} ajouté${savedCount > 1 ? 's' : ''} ; ${failedCount} échec${failedCount > 1 ? 's' : ''}. Vérifie les produits restants et réessaie.`, 'error');
            }
        } catch (error) {
            if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
            console.error('Erreur inattendue lors de la publication des produits.', error);
            savedEntries.forEach(entry => entry.remove());
            updateProductEntryLabels();
            showToast('Erreur lors de la publication des produits. Vérifie les produits restants et réessaie.', 'error');
        } finally {
            productFormSubmitting = false;
            updateImageMode();
            updateProductEntryLabels();
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.innerHTML = initialSubmitLabel;
        }
    });
}

function setupShopForm() {
    const latInput = document.getElementById('shopLat');
    const lngInput = document.getElementById('shopLng');
    const mapContainer = document.getElementById('shopCreateMap');
    const form = document.getElementById('createShopForm');

    const initializeShopMap = async () => {
        if (!mapContainer) return;

        try {
            const pos = await getUserPosition();
            const startLat = parseFloat(latInput.value) || pos.lat;
            const startLng = parseFloat(lngInput.value) || pos.lng;
            // store with higher precision for exact positioning
            latInput.value = startLat.toFixed(6);
            lngInput.value = startLng.toFixed(6);

            const mapInstance = L.map('shopCreateMap', {
                zoomControl: true,
                attributionControl: false
            }).setView([startLat, startLng], 18);

            attachMapLayerControls(mapContainer, mapInstance, 'osm');

            const centerPin = document.createElement('div');
            centerPin.className = 'center-map-pin';
            centerPin.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            mapContainer.appendChild(centerPin);

            const updateCenterInputs = () => {
                const center = mapInstance.getCenter();
                latInput.value = center.lat.toFixed(4);
                lngInput.value = center.lng.toFixed(4);
            };

            mapInstance.on('moveend', updateCenterInputs);
            updateCenterInputs();
        } catch (error) {
            if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
            console.warn('Impossible d\'initialiser la carte de boutique:', error);
            mapContainer.innerHTML = '<div class="empty-state"><i class="fas fa-location-dot"></i><p>Autorise la localisation pour placer votre boutique sur la carte.</p></div>';
            showToast('Autorise la localisation pour créer une boutique.', 'warning');
        }
    };

    setTimeout(() => initializeShopMap(), 250);

    form?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('shopName').value.trim();
        const category = document.getElementById('shopCategory').value.trim();
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (!name || !category || Number.isNaN(lat) || Number.isNaN(lng)) {
            showToast('Remplis tous les champs de la boutique et place la boutique sur la carte.', 'warning');
            return;
        }

        const address = `Coordonnées ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        try {
            const shopId = await createShop({
                owner_id: CURRENT_USER.id,
                name,
                category,
                lat,
                lng,
                address
            });

            if (!shopId) {
                throw new Error('Erreur création boutique');
            }

            const newShop = {
                id: shopId,
                ownerId: CURRENT_USER.id,
                name,
                category,
                lat,
                lng,
                followed: false,
                status: 'open',
                address
            };

            SHOPS.push(newShop);
            CURRENT_USER.shopId = shopId;
            CURRENT_USER.role = 'seller';
            localStorage.setItem('ag7_current_user', JSON.stringify(CURRENT_USER));

            showToast('Boutique créée ! Tu peux maintenant ajouter des produits.', 'success');
            renderShopOrProduct(document.getElementById('pageContainer'));
        } catch (error) {
            if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
            showToast('Erreur lors de la création de la boutique.', 'error');
        }
    });
}
