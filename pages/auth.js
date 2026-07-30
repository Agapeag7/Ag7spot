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
                        <p>Connecte-toi ou crée un compte pour explorer les boutiques de la RDC en toute confiance.</p>
                    </div>
                    <div class="auth-illustration">
                        <i class="fas fa-map-pin"></i>
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
                        <label>Adresse e-mail</label>
                        <input type="email" id="authEmail" placeholder="exemple@domaine.com" required />
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
    const authForm = document.getElementById('authForm');
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
        loginNote.classList.toggle('hidden', isRegister);
        registerNote.classList.toggle('hidden', !isRegister);
    };

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    setMode('login');

    authForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const mode = authForm.dataset.mode;
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;

        if (!email || !password) {
            showToast('Veuillez remplir tous les champs obligatoires.', 'warning');
            return;
        }

        if (mode === 'login') {
            const matchingUser = USERS.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
            if (!matchingUser) {
                showToast('Email ou mot de passe invalide.', 'error');
                return;
            }
            localStorage.setItem('ag7_current_user', JSON.stringify(matchingUser));
            localStorage.removeItem('ag7_onboarding_done');
            applyStoredUser(matchingUser);
            updateHeaderActionsVisibility();
            showToast('Bienvenue, ' + matchingUser.username + ' !', 'success');
            navigateTo('feed');
            return;
        }

        const name = document.getElementById('authName').value.trim();
        const confirmPassword = document.getElementById('authConfirmPassword').value;
        const privacyAccepted = document.getElementById('authPrivacy').checked;

        if (!name) {
            showToast('Merci de renseigner ton nom complet.', 'warning');
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

        if (USERS.some(user => user.email.toLowerCase() === email.toLowerCase())) {
            showToast('Cette adresse e-mail est déjà utilisée.', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username: name,
            email,
            password,
            role: 'buyer',
            avatar: name.split(' ').map(part => part[0]?.toUpperCase()).join('').slice(0, 2),
            points: 0,
            shopId: null
        };

        USERS.push(newUser);
        localStorage.setItem('ag7_current_user', JSON.stringify(newUser));
        localStorage.removeItem('ag7_onboarding_done');
        applyStoredUser(newUser);
        updateHeaderActionsVisibility();
        showToast('Compte créé avec succès !', 'success');
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
