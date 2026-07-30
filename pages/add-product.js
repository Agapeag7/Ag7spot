// =========================================
// PAGE : AJOUTER UN PRODUIT / CRÉER MA BOUTIQUE
// =========================================
function renderAddProduct(container) {
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
    const hasShop = ownedShops.length > 0;

    container.innerHTML = `
        <div class="page active">
            <h2 class="section-title"><i class="fas fa-shopping-bag"></i> ${hasShop ? 'Ajouter un produit' : 'Créer ma boutique'}</h2>
            <div class="form-card">
                ${hasShop ? `
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
                ` : `
                    <p>Tu n'as pas encore de boutique. Crée-la pour vendre dans l'application et apparaître sur la carte.</p>
                    <form id="createShopForm">
                        <div class="form-group">
                            <label>Nom de la boutique</label>
                            <input type="text" id="shopName" placeholder="Ex: Ma boutique locale" required />
                        </div>
                        <div class="form-group">
                            <label>Catégorie</label>
                            <input type="text" id="shopCategory" placeholder="Ex: mode, food, tech" required />
                        </div>
                        <div class="form-group">
                            <label>Adresse</label>
                            <input type="text" id="shopAddress" placeholder="Ex: 12 Rue Victor Hugo" required />
                        </div>
                        <div class="form-group">
                            <label>Latitude</label>
                            <input type="number" id="shopLat" placeholder="45.7640" step="0.0001" required />
                        </div>
                        <div class="form-group">
                            <label>Longitude</label>
                            <input type="number" id="shopLng" placeholder="4.8357" step="0.0001" required />
                        </div>
                        <button type="submit" class="btn-primary w-full">
                            <i class="fas fa-store"></i> Créer ma boutique
                        </button>
                    </form>
                `}
            </div>
        </div>
    `;

    if (hasShop) {
        setupProductForm();
    } else {
        setupShopForm();
    }
}

function setupProductForm() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            uploadArea.classList.add('has-image');
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color:var(--success);"></i>
                <span>${this.files[0].name}</span>
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

        const newProduct = {
            id: Date.now(),
            shopId,
            name,
            price,
            stock,
            description,
            image: 'https://picsum.photos/seed/' + Date.now() + '/400/400',
            distance: 0
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            PRODUCTS.push(newProduct);
            showToast('✅ Produit ajouté avec succès !', 'success');
            this.reset();
            uploadArea.classList.remove('has-image');
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Cliquez pour importer une image</span>
                <input type="file" id="fileInput" accept="image/*" />
            `;
            setupProductForm();
        } catch (error) {
            showToast('Erreur lors de l\'ajout du produit.', 'error');
        }
    });
}

function setupShopForm() {
    const latInput = document.getElementById('shopLat');
    const lngInput = document.getElementById('shopLng');

    getUserPosition().then(pos => {
        if (pos) {
            latInput.value = pos.lat.toFixed(4);
            lngInput.value = pos.lng.toFixed(4);
        }
    });

    document.getElementById('createShopForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('shopName').value.trim();
        const category = document.getElementById('shopCategory').value.trim();
        const address = document.getElementById('shopAddress').value.trim();
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (!name || !category || !address || Number.isNaN(lat) || Number.isNaN(lng)) {
            showToast('Remplis tous les champs de la boutique.', 'warning');
            return;
        }

        const newShop = {
            id: Date.now(),
            ownerId: CURRENT_USER.id,
            name,
            category,
            lat,
            lng,
            avatar: 'https://picsum.photos/seed/shop' + Date.now() + '/100/100',
            cover: 'https://picsum.photos/seed/shop' + Date.now() + '/600/300',
            followed: false,
            status: 'open',
            address
        };

        SHOPS.push(newShop);
        CURRENT_USER.shopId = newShop.id;

        showToast('✅ Boutique créée ! Tu peux maintenant ajouter des produits.', 'success');
        renderAddProduct(document.getElementById('pageContainer'));
    });
}
