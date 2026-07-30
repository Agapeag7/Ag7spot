// =========================================
// PAGE : PROFIL UTILISATEUR
// =========================================
function renderProfile(container) {
    const user = CURRENT_USER;

    container.innerHTML = `
        <div class="page active">
            <div class="profile-card">
                <div class="avatar">${user.avatar}</div>
                <h3>${user.username}</h3>
                <p class="profile-role">Développeur & Créateur</p>
                <div class="profile-stats">
                    <div><strong>${SHOPS.filter(s => s.followed).length}</strong> <span>Abonnements</span></div>
                    <div><strong>${PRODUCTS.length}</strong> <span>Produits</span></div>
                    <div><strong>${user.points}</strong> <span>Points</span></div>
                </div>
                <button class="btn-outline profile-edit-btn" onclick="alert('✏️ Édition du profil (simulation)')">
                    <i class="fas fa-edit"></i> Modifier le profil
                </button>
            </div>

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

                    <!--
                    <span class="settings-value" onclick="preloadOfflineMap()" style="cursor:pointer;color:var(--primary);">
                        <i class="fas fa-download"></i> Télécharger
                    </span>
                    -->
                </div>
                
            </div>
        </div>
    `;
}

function preloadOfflineMap() {
    showToast('🗺️ Téléchargement de la carte en cours...', 'info');
    getUserPosition().then(pos => {
        // Simuler un téléchargement
        setTimeout(() => {
            showToast('✅ Carte téléchargée pour le hors-ligne', 'success');
            localStorage.setItem('offline_map_downloaded', 'true');
        }, 2000);
    });
}