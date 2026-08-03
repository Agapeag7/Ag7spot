// =========================================
// PAGE : PROFIL UTILISATEUR
// =========================================
function renderProfile(container) {
    const user = CURRENT_USER;

    const myShop = SHOPS.find(s => s.ownerId === user.id);
    const followCount = SHOPS.filter(s => s.followed).length;
    const productCount = PRODUCTS.filter(p => {
        const shop = SHOPS.find(sh => sh.id === p.shopId);
        return shop && shop.ownerId === user.id;
    }).length;
    const roleLabel = user.role === 'seller' ? 'Vendeur' : 'Acheteur';

    container.innerHTML = `
        <div class="page active">
            <div class="profile-card">
                <div class="avatar">${user.avatar}</div>
                <h3>${user.username}</h3>
                <p class="profile-role">${roleLabel}</p>
                <div class="profile-stats">
                    <div><strong>${followCount}</strong> <span>Abonnements</span></div>
                    <div><strong>${productCount}</strong> <span>Mes produits</span></div>
                    <div><strong>${user.points}</strong> <span>Points</span></div>
                </div>
                <button class="btn-outline profile-edit-btn" onclick="alert('✏️ Édition du profil (simulation)')">
                    <i class="fas fa-edit"></i> Modifier le profil
                </button>
            </div>

            <div class="settings-card">
                <h4><i class="fas fa-store"></i> Ma boutique</h4>
                ${user.role === 'seller' ? `
                    ${myShop ? `
                        <div class="settings-item">
                            <span>${myShop.name}</span>
                            <span class="settings-value">${renderShopStatus(myShop)}</span>
                        </div>
                        <div class="settings-item">
                            <span>Adresse</span>
                            <span class="settings-value">${myShop.address}</span>
                        </div>
                        <button class="btn-primary w-full" onclick="navigateTo('add')">
                            <i class="fas fa-plus-circle"></i> ${myShop ? 'Ajouter un produit' : 'Créer ma boutique'}
                        </button>
                    ` : `
                        <p>Tu n'as pas encore de boutique. Crée-la pour vendre dans l'application.</p>
                        <button class="btn-primary w-full" onclick="navigateTo('add')">
                            <i class="fas fa-store"></i> Créer ma boutique
                        </button>
                    `}
                ` : `
                    <p>En tant qu'acheteur, tu peux que parcourir des boutiques et découvrir des produits.</p>
                `}
            </div>

            ${user.role === 'seller' && myShop ? `
                <div class="settings-card">
                    <div class="section-title">
                        <span><i class="fas fa-box-open"></i> Produits déjà ajoutés</span>
                        <a href="#" onclick="navigateTo('profile')">Actualiser</a>
                    </div>
                    <div id="sellerProductsList">
                        ${renderSellerProducts([myShop.id])}
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
}

function preloadOfflineMap() {
    showToast('Téléchargement de la carte en cours...', 'info');
    getUserPosition().then(pos => {
        // Simuler un téléchargement
        setTimeout(() => {
            showToast('Carte téléchargée pour le hors-ligne', 'success');
            localStorage.setItem('offline_map_downloaded', 'true');
        }, 2000);
    });
}