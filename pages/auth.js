// =========================================
// PAGE : AUTHENTIFICATION / CRÉATION DE COMPTE
// =========================================
function renderAuth(container) {
    container.innerHTML = `
        <div class="page active auth-page">
            <div class="auth-card">
                <h2>Bienvenue sur Ag7Spot</h2>
                <p>Connecte-toi avec un compte existant pour continuer.</p>
                <form id="authForm">
                    <div class="form-group">
                        <label>Ton email</label>
                        <input type="email" id="authEmail" placeholder="exemple@mail.com" required />
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="authPassword" placeholder="••••••••" required />
                    </div>
                    <button type="submit" class="btn-primary w-full">
                        <i class="fas fa-sign-in-alt"></i> Se connecter
                    </button>
                </form>
                <p class="auth-note">Tu dois déjà posséder un compte pour te connecter. Aucun nouvel enregistrement n'est possible ici.</p>
            </div>
        </div>
    `;

    document.getElementById('authForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;

        if (!email || !password) {
            showToast('Veuillez remplir tous les champs.', 'warning');
            return;
        }

        const matchingUser = USERS.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
        if (!matchingUser) {
            showToast('Email ou mot de passe invalide.', 'error');
            return;
        }

        localStorage.setItem('ag7_current_user', JSON.stringify(matchingUser));
        localStorage.removeItem('ag7_onboarding_done');
        applyStoredUser(matchingUser);

        showToast('Bienvenue, ' + matchingUser.username + ' !', 'success');
        navigateTo('feed');
    });
}

function applyStoredUser(user) {
    if (!user || typeof user !== 'object') return;
    CURRENT_USER.id = user.id || CURRENT_USER.id;
    CURRENT_USER.username = user.username || CURRENT_USER.username;
    CURRENT_USER.points = user.points ?? CURRENT_USER.points;
    CURRENT_USER.avatar = user.avatar || CURRENT_USER.avatar;
    CURRENT_USER.shopId = user.shopId || null;
    CURRENT_USER.role = user.role || 'buyer';
}
