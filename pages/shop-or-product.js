// =========================================
// PAGE : AJOUTER UN PRODUIT / CRÉER MA BOUTIQUE
// =========================================
function renderShopOrProduct(container) {
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
                                <option value="fashion">Vêtements et chaussures</option>
                                <option value="home">Maison et déco</option>
                                <option value="tech">High-tech et électronique</option>
                                <option value="beauty">Santé et beauté</option>
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
                        <div class="form-group">
                            <label>Nom du produit</label>
                            <input type="text" id="productName" placeholder="Ex: Sweat à capuche oversize" required />
                        </div>
                        <div class="form-group">
                            <label>Prix ($)</label>
                            <input type="number" id="productPrice" placeholder="49.99" step="0.01" required />
                        </div>
                        <div class="form-group">
                            <label>Ma boutique</label>
                            <select id="productShop">
                                ${ownedShops.map(shop => `<option value="${shop.id}">${shop.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quantité en stock</label>
                            <input type="number" id="productStock" placeholder="10" value="5" min="0" />
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="productDesc" placeholder="Taille, matière, couleur..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Photo du produit</label>
                            <div class="image-upload" id="imageUploadArea">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Cliquez pour importer une image</span>
                                <input type="file" id="fileInput" accept="image/*" />
                            </div>
                        </div>
                        <button type="submit" class="btn-primary w-full">
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
                    <p>${shop.name} · ${product.stock} en stock</p>
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
    const stockValue = prompt('Modifier la quantité en stock', product.stock);
    if (stockValue === null) return;

    const price = parseFloat(priceValue);
    const stock = parseInt(stockValue, 10);
    if (!name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
        showToast('Valeurs invalides.', 'warning');
        return;
    }

    try {
        const success = await updateProduct(productId, {
            name: name.trim(),
            price,
            stock,
            description: product.description || '',
            image: product.image || ''
        });

        if (success) {
            product.name = name.trim();
            product.price = price;
            product.stock = stock;
            showToast('Produit mis à jour.', 'success');
            renderProfile(document.getElementById('pageContainer'));
        } else {
            throw new Error('Échec mise à jour produit');
        }
    } catch (error) {
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
        showToast('Erreur lors de la suppression du produit.', 'error');
    }
}

function setupProductForm() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            uploadArea.classList.add('has-image');
            const previewUrl = URL.createObjectURL(file);
            uploadArea.innerHTML = `
                <img src="${previewUrl}" alt="preview" class="preview-img" />
                <span>${file.name}</span>
            `;
        }
    });

    document.getElementById('addProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const shopId = parseInt(document.getElementById('productShop').value, 10);
        const stock = parseInt(document.getElementById('productStock').value, 10) || 0;
        const description = document.getElementById('productDesc').value.trim();

        if (!name || !price || Number.isNaN(price)) {
            showToast('Veuillez remplir tous les champs correctement.', 'warning');
            return;
        }

        // Préparer l'upload : utiliser FormData si une image est sélectionnée
        const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
        const formData = new FormData();
        formData.append('shop_id', shopId);
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        if (file) {
            formData.append('image', file);
        } else {
            const fallbackImage = 'https://picsum.photos/seed/' + Date.now() + '/400/400';
            formData.append('image', fallbackImage);
        }

        try {
            // Debug: log FormData entries to help diagnose missing fields server-side
            console.debug('submitProduct: values', { name, price, shopId, stock, description, file });
            if (formData instanceof FormData) {
                for (const pair of formData.entries()) {
                    console.debug('formData', pair[0], pair[1]);
                }
            }
            const res = await addProduct(formData);
            const productId = res && res.product_id ? res.product_id : null;
            const imageUrl = (res && (res.image_url || res.image)) || (formData.get('image') || '');
            if (productId) {
                PRODUCTS.push({
                    id: productId,
                    shopId,
                    name,
                    price,
                    stock,
                    description,
                    image: imageUrl,
                    distance: 0
                });
                showToast('Produit ajouté avec succès !', 'success');
                renderShopOrProduct(document.getElementById('pageContainer'));
            } else {
                throw new Error('Erreur création produit');
            }
        } catch (error) {
            showToast('Erreur lors de l\'ajout du produit.', 'error');
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

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(mapInstance);

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

        const avatar = 'https://picsum.photos/seed/shop' + Date.now() + '/100/100';
        const cover = 'https://picsum.photos/seed/shop' + Date.now() + '/600/300';
        const address = `Coordonnées ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        try {
            const shopId = await createShop({
                owner_id: CURRENT_USER.id,
                name,
                category,
                lat,
                lng,
                avatar,
                cover,
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
                avatar,
                cover,
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
            showToast('Erreur lors de la création de la boutique.', 'error');
        }
    });
}
