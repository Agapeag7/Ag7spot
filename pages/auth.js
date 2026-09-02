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
                        <input type="text" id="authEmail" name="username" autocomplete="username" placeholder="Entrez votre nom d\'utilisateur" required />
                        <small class="auth-username-hint hidden" style="color: var(--text-gray)">Le nom doit contenir entre 5 et 20 caractères.</small>
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
                            J'accepte la <a href="#" class="link" onclick="navigateTo('privacy'); return false;">politique de confidentialité</a> et <a href="#" class="link" onclick="navigateTo('terms'); return false;">Conditions d'utilisation</a> de l'application.
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-primary w-full auth-submit-btn">
                        <i class="fas fa-sign-in-alt"></i> Se connecter
                    </button>

                    <div class="form-group auth-remember-field">
                        <label class="checkbox-label">
                            <input type="checkbox" id="authRememberMe" checked />
                            <span>Se souvenir de moi</span>
                        </label>
                    </div>
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
    const usernameHint = container.querySelector('.auth-username-hint');
    const rememberMeInput = container.querySelector('#authRememberMe');

    const generateUsernameWithSuffix = () => {
        const rawValue = authEmailInput.value.trim();
        if (!rawValue) return;

        const hasAutoSuffix = /\d{2,}$/.test(rawValue);
        if (hasAutoSuffix) return;

        const base = rawValue.replace(/\d+$/, '').trim() || 'user';
        const suffix = String(Math.floor(1000 + Math.random() * 9000));
        authEmailInput.value = `${base}${suffix}`;
    };

    const setMode = (mode) => {
        authForm.dataset.mode = mode;
        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        const isRegister = mode === 'register';
        registerFields.forEach(field => field.classList.toggle('hidden', !isRegister));
        if (passwordHint) {
            passwordHint.classList.toggle('hidden', !isRegister);
        }
        if (usernameHint) {
            usernameHint.classList.toggle('hidden', !isRegister);
        }
        if (isRegister && authEmailInput.value.trim()) {
            generateUsernameWithSuffix();
        }
        submitBtn.innerHTML = isRegister ? '<i class="fas fa-user-plus"></i> Créer mon compte' : '<i class="fas fa-sign-in-alt"></i> Se connecter';
        authEmailLabel.textContent = 'Nom d\'utilisateur';
        authEmailInput.placeholder = isRegister ? 'Entrez votre nom d\'utilisateur' : 'Entrez votre nom d\'utilisateur';
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
        if (mode === 'register') {
            generateUsernameWithSuffix();
        }
        const identifier = container.querySelector('#authEmail').value.trim();
        const password = container.querySelector('#authPassword').value;
        const rememberMe = rememberMeInput ? rememberMeInput.checked : false;

        if (!identifier || !password) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'warning');
            return;
        }

        if (mode === 'login') {
            try {
                const response = await login(identifier, password, rememberMe);
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
            const response = await register(username, password, accountType, rememberMe);
            const user = response.user;
            localStorage.setItem('ag7_current_user', JSON.stringify(user));
            localStorage.removeItem('onboarding_done');
            applyStoredUser(user);
            updateHeaderActionsVisibility();
            showToast('Compte créé avec succès !', 'success');

            if (shouldShowOnboardingForUser(user.id)) {
                renderOnboarding();
                const onboardingModal = document.getElementById('onboardingModal');
                if (onboardingModal) {
                    onboardingModal.classList.remove('hidden');
                }
                return;
            }

            navigateTo('feed');
        } catch (error) {
            // showToast already handled in apiCall
        }
    });
}

function renderLegalPage(container, type = 'privacy') {
    const title = type === 'privacy' ? 'Politique de confidentialité' : 'Conditions d\'utilisation';
    const intro = type === 'privacy'
        ? 'Cette politique décrit la manière dont Ag7Spot collecte, utilise, protège et conserve vos données personnelles.'
        : 'En utilisant Ag7Spot, vous acceptez les présentes conditions d\'utilisation, qui encadrent votre accès et votre usage de l\'application.';

    const content = type === 'privacy' ? `
        <h2>Politique de confidentialité</h2>
        <p>${intro}</p>
        <h3>1. Données collectées</h3>
        <p>Nous collectons les informations nécessaires à la création du compte, à l\'authentification, à la gestion de vos achats et ventes, ainsi qu\'aux services de messagerie et notifications.</p>
        <h3>2. Utilisation des données</h3>
        <p>Les données sont utilisées pour sécuriser votre compte, personnaliser votre expérience, traiter les commandes, gérer les boutiques et améliorer la qualité du service.</p>
        <h3>3. Protection</h3>
        <p>Nous mettons en place des mesures techniques et organisationnelles raisonnables pour protéger vos informations contre l\'accès non autorisé, la modification ou la divulgation.</p>
        <h3>4. Consentement</h3>
        <p>En créant un compte ou en utilisant le service, vous consentez au traitement de vos données conformément à cette politique.</p>
        <h3>5. Droits</h3>
        <p>Vous pouvez demander la consultation, la mise à jour ou la suppression de vos données personnelles, selon les règles applicables et la législation en vigueur.</p>
    ` : `
        <h2>Conditions d'utilisation</h2>
        <p>${intro}</p>
        <h3>1. Objet</h3>
        <p>Ag7Spot permet de découvrir des boutiques, des promotions, de gérer un profil et d\'interagir avec d\'autres utilisateurs.</p>
        <h3>2. Obligations de l'utilisateur</h3>
        <p>Vous vous engagez à fournir des informations honnêtes, à respecter les règles de la plateforme et à ne pas utiliser le service à des fins illicites, abusives ou frauduleuses.</p>
        <h3>3. Compte utilisateur</h3>
        <p>Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités liées à votre compte.</p>
        <h3>4. Modération et sécurité</h3>
        <p>Nous nous réservons le droit de suspendre ou supprimer un compte en cas de comportement contraire aux règles de sécurité ou de communauté.</p>
        <h3>5. Responsabilité</h3>
        <p>Ag7Spot fournit le service tel quel et ne peut être tenu responsable des contenus publiés par les utilisateurs ou des incidents liés à l\'usage et aux conditions externes.</p>
    `;

    container.innerHTML = `
        <div class="page active auth-page">
            <div class="auth-card">
                <div class="auth-header">
                    <div>
                        <span class="auth-badge">Ag7Spot</span>
                        <h2>${title}</h2>
                    </div>
                    <div class="auth-illustration">
                        <img src="ico/spot.png" alt="Ag7Spot" class="app-icon" />
                    </div>
                </div>
                <div class="legal-content" style="display:grid; gap:12px; color: var(--text-main); line-height:1.7; font-size:14px;">
                    ${content}
                </div>
                <div style="margin-top: 18px;">
                    <button type="button" class="btn-primary" onclick="navigateTo('auth')">Retour</button>
                </div>
            </div>
        </div>
    `;
}

function renderPrivacyPolicy(container) {
    renderLegalPage(container, 'privacy');
}

function renderTerms(container) {
    renderLegalPage(container, 'terms');
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
