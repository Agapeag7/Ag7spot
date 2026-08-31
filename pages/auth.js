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
                    <div class="form-group">
                        <label id="authEmailLabel">Nom d'utilisateur</label>
                        <input type="text" id="authEmail" name="username" autocomplete="username" placeholder="Entrez votre nom d'utilisateur" required />
                    </div>
                    <div class="form-group auth-register-field hidden">
                        <label>Type de compte</label>
                        <select id="authAccountType" class="auth-select" autocomplete="off">
                            <option value="buyer">Acheteur</option>
                            <option value="seller">Vendeur</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="authPassword" name="password" autocomplete="current-password" placeholder="••••••••" required />
                        
                        <small class="auth-password-hint hidden" style="color: var(--danger)">Le mot de passe doit contenir au moins 12 caractères, incluant une minuscule, une majuscule, un chiffre et un caractère spécial.</small>
                    </div>
                    <div class="form-group auth-register-field hidden">
                        <label>Confirmer le mot de passe</label>
                        <input type="password" id="authConfirmPassword" name="new-password" autocomplete="new-password" placeholder="••••••••" />
                    </div>
                    <div class="form-group auth-register-field hidden privacy-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="authPrivacy" />
                            J'accepte la <a href="#" class="link">politique de confidentialité</a> et <a href="#" class="link">Conditions d'utilisation</a> de l'application.
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
    const passwordHint = container.querySelector('.auth-password-hint');

    const setMode = (mode) => {
        authForm.dataset.mode = mode;
        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        const isRegister = mode === 'register';
        registerFields.forEach(field => field.classList.toggle('hidden', !isRegister));
        if (passwordHint) {
            passwordHint.classList.toggle('hidden', !isRegister);
        }
        submitBtn.innerHTML = isRegister ? '<i class="fas fa-user-plus"></i> Créer mon compte' : '<i class="fas fa-sign-in-alt"></i> Se connecter';
        authEmailLabel.textContent = 'Nom d\'utilisateur';
        authEmailInput.placeholder = 'Entrez votre nom d\'utilisateur';
        authEmailInput.type = 'text';
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

        const username = identifier.trim();
        const confirmPassword = container.querySelector('#authConfirmPassword').value;
        const accountType = container.querySelector('#authAccountType').value;
        const privacyAccepted = container.querySelector('#authPrivacy').checked;

        if (!username) {
            showToast('Merci de renseigner un nom d\'utilisateur.', 'warning');
            return;
        }

        if (password.length < 12) {
            showToast('Le mot de passe doit contenir au moins 12 caractères.', 'warning');
            return;
        }

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
            showToast('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial.', 'warning');
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
            const response = await register(username, password, accountType);
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
