// =========================================
// PAGE : AJOUTER UN PRODUIT
// =========================================
function renderAddProduct(container) {
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
                        <label>Prix (€)</label>
                        <input type="number" id="productPrice" placeholder="49.99" step="0.01" required />
                    </div>
                    <div class="form-group">
                        <label>Ma boutique</label>
                        <select id="productShop">
                            ${SHOPS.filter(s => s.followed).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            ${SHOPS.filter(s => !s.followed).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
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

    // Upload d'image
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

    // Soumission du formulaire
    document.getElementById('addProductForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const shopId = parseInt(document.getElementById('productShop').value);
        const stock = parseInt(document.getElementById('productStock').value) || 0;
        const description = document.getElementById('productDesc').value;

        if (!name || !price) {
            showToast('Veuillez remplir tous les champs', 'warning');
            return;
        }

        const newProduct = {
            name,
            price,
            shopId,
            stock,
            description,
            image: 'https://picsum.photos/seed/' + Date.now() + '/400/400'
        };

        try {
            // Appel API simulé
            await new Promise(resolve => setTimeout(resolve, 800));
            PRODUCTS.push({
                id: Date.now(),
                ...newProduct,
                distance: '0 km'
            });
            showToast('✅ Produit ajouté avec succès !', 'success');
            this.reset();
            document.getElementById('imageUploadArea').innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Cliquez pour importer une image</span>
                <input type="file" id="fileInput" accept="image/*" />
            `;
            document.getElementById('imageUploadArea').classList.remove('has-image');
            // Re-attacher l'événement
            document.getElementById('fileInput').addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const area = document.getElementById('imageUploadArea');
                    area.classList.add('has-image');
                    area.innerHTML = `
                        <i class="fas fa-check-circle" style="color:var(--success);"></i>
                        <span>${this.files[0].name}</span>
                    `;
                }
            });
        } catch (e) {
            showToast('Erreur lors de l\'ajout', 'error');
        }
    });
}