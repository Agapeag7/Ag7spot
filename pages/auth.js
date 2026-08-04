// =========================================
// PAGE : AUTHENTIFICATION / CRÉATION DE COMPTE
// =========================================
function renderAuth(container) {
    container.innerHTML = `
        <div class="page active auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <div>
                        <span class="auth-badge">Ag7Spot</span>
                        <h2>Bienvenue</h2>
                        <p>Connecte-toi ou crée un compte.</p>
                    </div>
                    <div class="auth-illustration">
                        <img src="ico/spot.png" alt="Ag7Spot" class="app-icon" />
                    </div>
                </div>
                <div class="auth-mode-toggle">
                    <button type="button" class="auth-mode-btn active" data-mode="login">Connexion</button>
                    <button type="button" class="auth-mode-btn" data-mode="register">Créer un compte</button>
                </div>
                <form id="authForm" class="auth-form" data-mode="login">
                    <div class="form-group auth-register-field hidden">
                        <label>Nom complet</label>
                        <input type="text" id="authName" placeholder="Jean Mbemba" />
                    </div>
                    <div class="form-group">
                        <label id="authEmailLabel">Adresse e-mail</label>
                        <input type="text" id="authEmail" placeholder="exemple@domaine.com" required />
                    </div>
                    <div class="form-group auth-register-field hidden">
                        <label>Type de compte</label>
                        <select id="authAccountType" class="auth-select">
                            <option value="buyer">Acheteur</option>
                            <option value="seller">Vendeur</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="authPassword" placeholder="••••••••" required />
                    </div>
                    <div class="form-group auth-register-field hidden">
                        <label>Confirmer le mot de passe</label>
                        <input type="password" id="authConfirmPassword" placeholder="••••••••" />
                    </div>
                    <div class="form-group auth-register-field hidden privacy-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="authPrivacy" />
                            J'accepte la <a href="#" class="link">politique de confidentialité</a> de l'application.
                        </label>
                    </div>
                    <button type="submit" class="btn-primary w-full auth-submit-btn">
                        <i class="fas fa-sign-in-alt"></i> Se connecter
                    </button>
                    <div class="auth-footer">
                        <p class="auth-note-login">Tu dois déjà posséder un compte pour te connecter.</p>
                        <p class="auth-note-register hidden">En créant un compte, tu acceptes la politique de confidentialité et les conditions d'utilisation.</p>
                    </div>
                </form>
            </div>
        </div>
    `;

    const modeButtons = container.querySelectorAll('.auth-mode-btn');
    const authForm = container.querySelector('#authForm');
    const authEmailLabel = container.querySelector('#authEmailLabel');
    const authEmailInput = container.querySelector('#authEmail');
    const registerFields = container.querySelectorAll('.auth-register-field');
    const submitBtn = container.querySelector('.auth-submit-btn');
    const loginNote = container.querySelector('.auth-note-login');
    const registerNote = container.querySelector('.auth-note-register');

    const setMode = (mode) => {
        authForm.dataset.mode = mode;
        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        const isRegister = mode === 'register';
        registerFields.forEach(field => field.classList.toggle('hidden', !isRegister));
        submitBtn.innerHTML = isRegister ? '<i class="fas fa-user-plus"></i> Créer mon compte' : '<i class="fas fa-sign-in-alt"></i> Se connecter';
        authEmailLabel.textContent = isRegister ? 'Adresse e-mail' : 'Nom d\'utilisateur';
        authEmailInput.placeholder = isRegister ? 'exemple@domaine.com' : 'Entrez votre nom d\'utilisateur';
        authEmailInput.type = isRegister ? 'email' : 'text';
        loginNote.classList.toggle('hidden', isRegister);
        registerNote.classList.toggle('hidden', !isRegister);
    };

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    setMode('login');

    authForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const mode = authForm.dataset.mode;
        const identifier = container.querySelector('#authEmail').value.trim();
        const password = container.querySelector('#authPassword').value;

        if (!identifier || !password) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'warning');
            return;
        }

        if (mode === 'login') {
            try {
                const response = await login(identifier, password);
                const user = response.user;
                localStorage.setItem('ag7_current_user', JSON.stringify(user));
                localStorage.removeItem('onboarding_done');
                applyStoredUser(user);
                updateHeaderActionsVisibility();
                showToast('Bienvenue, ' + user.username + ' !', 'success');
                navigateTo('feed');
            } catch (error) {
                // showToast already handled in apiCall
            }
            return;
        }

        const name = container.querySelector('#authName').value.trim();
        const email = identifier;
        const confirmPassword = container.querySelector('#authConfirmPassword').value;
        const accountType = container.querySelector('#authAccountType').value;
        const privacyAccepted = container.querySelector('#authPrivacy').checked;

        if (!name) {
            showToast('Merci de renseigner ton nom complet.', 'warning');
            return;
        }
        if (!email) {
            showToast('Merci de renseigner une adresse e-mail valide.', 'warning');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Les mots de passe ne correspondent pas.', 'warning');
            return;
        }
        if (!privacyAccepted) {
            showToast('Tu dois accepter la politique de confidentialité.', 'warning');
            return;
        }

        try {
            const response = await register(name, email, password, accountType);
            const user = response.user;
            localStorage.setItem('ag7_current_user', JSON.stringify(user));
            localStorage.removeItem('onboarding_done');
            applyStoredUser(user);
            updateHeaderActionsVisibility();
            showToast('Compte créé avec succès !', 'success');
            navigateTo('feed');
        } catch (error) {
            // showToast already handled in apiCall
        }
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
