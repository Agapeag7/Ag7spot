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
        <p>Nous collectons les informations nécessaires à la création et à la gestion du compte, notamment le nom d\'utilisateur, le type de compte, les informations de profil et les données nécessaires à l\'authentification.</p>
        <p>Selon les fonctions utilisées, nous pouvons également traiter les boutiques, produits, images, messages, réservations, suivis, notifications, points, check-ins et informations de localisation publiés ou transmis dans l\'application.</p>
        <h3>2. Finalités du traitement</h3>
        <p>Ces données servent à sécuriser les comptes, permettre la mise en relation entre acheteurs et vendeurs, personnaliser le fil, afficher les boutiques proches, gérer les boutiques et produits, transmettre les notifications et assurer le fonctionnement des réservations et du chat.</p>
        <p>Elles peuvent aussi être utilisées pour prévenir la fraude, protéger les utilisateurs, modérer les contenus, résoudre les incidents et respecter nos obligations légales.</p>
        <h3>3. Géolocalisation</h3>
        <p>Lorsque vous l\'autorisez, votre position peut servir à afficher les commerces proches, filtrer le fil, calculer des distances et préparer un parcours. La géolocalisation est indicative, peut être imprécise ou indisponible, et l\'autorisation peut être retirée depuis les réglages de votre appareil. Certaines fonctions peuvent alors ne plus être disponibles.</p>
        <h3>4. Messages et données sensibles</h3>
        <p>Les messages et demandes envoyés dans l\'application peuvent être conservés pour fournir le service, assurer la sécurité et traiter les signalements. Ag7Spot ne demande jamais votre mot de passe par message. Évitez de communiquer dans le chat des données sensibles ou inutiles.</p>
        <h3>5. Conservation et partage</h3>
        <p>Les données sont conservées pendant la durée nécessaire aux finalités décrites, à la sécurité du service et au respect des obligations légales. Elles peuvent être accessibles aux personnes et prestataires strictement nécessaires au fonctionnement d\'Ag7Spot, ainsi qu\'aux autorités lorsque la loi l\'exige. Ag7Spot ne vend pas vos données personnelles.</p>
        <h3>6. Protection</h3>
        <p>Nous mettons en place des mesures techniques et organisationnelles raisonnables pour protéger vos informations contre l\'accès non autorisé, la modification, la perte ou la divulgation.</p>
        <h3>7. Vos droits</h3>
        <p>Vous pouvez demander la consultation, la rectification, la suppression ou la limitation du traitement de vos données, selon les règles applicables. Vous pouvez également retirer les autorisations facultatives. Toute demande peut être adressée à Ag7Spot par les moyens de contact indiqués dans l\'application.</p>
        <h3>8. Évolution de la politique</h3>
        <p>Cette politique peut évoluer pour tenir compte des changements du service, de la loi ou de la sécurité. En cas de modification substantielle, nous vous en informerons par un moyen adapté et une nouvelle acceptation pourra être demandée.</p>
    ` : `
        <h2>Conditions d'utilisation</h2>
        <p>${intro}</p>
        <h3>1. Objet du service</h3>
        <p>Ag7Spot est une plateforme de découverte du commerce local. Elle permet de rechercher des boutiques et des produits, de consulter leur position, de suivre des boutiques, de contacter un vendeur, de préparer une visite et, pour les vendeurs autorisés, de gérer une boutique et de publier des produits.</p>
        <p>Ag7Spot est une plateforme de mise en relation et d\'information. Sauf indication expresse contraire, Ag7Spot ne vend pas les produits, n\'est pas partie aux ventes et ne garantit ni la disponibilité, ni le prix, ni la qualité ou la conformité des offres publiées par un vendeur.</p>
        <h3>2. Compte et accès</h3>
        <p>Vous devez avoir la capacité juridique de contracter et fournir des informations exactes, à jour et complètes. Vous êtes responsable de la confidentialité de vos identifiants et des activités réalisées depuis votre compte. Prévenez Ag7Spot sans délai en cas d\'accès non autorisé.</p>
        <h3>3. Utilisation interdite</h3>
        <p>Il est interdit d\'usurper l\'identité d\'une personne, d\'utiliser le compte d\'autrui, de publier des contenus faux, trompeurs, diffamatoires ou illicites, de proposer un produit interdit, de harceler ou menacer un utilisateur, de contourner les contrôles de sécurité, d\'accéder aux données d\'autrui, d\'extraire automatiquement le catalogue ou d\'utiliser le service de manière frauduleuse.</p>
        <h3>4. Obligations du vendeur</h3>
        <p>Le vendeur est responsable de sa boutique, de ses produits, prix, stocks, images, descriptions et horaires. Il doit respecter les lois et obligations applicables à son activité, disposer des droits nécessaires sur ses contenus et actualiser rapidement les informations publiées.</p>
        <p>La publication d\'un produit ne constitue ni une validation, ni une certification, ni une recommandation d\'Ag7Spot.</p>
        <h3>5. Messages, réservations et transactions</h3>
        <p>Un message ou une demande envoyée dans l\'application ne vaut pas réservation ferme, commande, promesse de vente ou paiement, sauf confirmation contraire du vendeur. Le prix final, le paiement, la livraison ou le retrait, les retours, les garanties et les réclamations sont convenus directement entre l\'acheteur et le vendeur.</p>
        <p>Ag7Spot ne perçoit aucun paiement et ne garantit pas l\'exécution d\'une transaction, sauf mention spécifique dans une fonctionnalité distincte.</p>
        <h3>6. Géolocalisation, check-in et points</h3>
        <p>Les positions, distances, horaires, itinéraires et temps de trajet sont des estimations. Vous restez responsable de vos déplacements et devez respecter les règles de sécurité et de circulation.</p>
        <p>Les points éventuellement accordés par un check-in sont une fonctionnalité promotionnelle : ils ne sont ni de la monnaie, ni un dépôt, ni une somme remboursable, et ne peuvent être vendus, cédés ou convertis en argent. Toute simulation de position ou utilisation frauduleuse peut entraîner leur retrait et la suspension du compte.</p>
        <h3>7. Contenus et propriété intellectuelle</h3>
        <p>Vous conservez vos droits sur vos contenus. En les publiant, vous accordez à Ag7Spot une licence mondiale, gratuite, non exclusive et limitée à la durée de leur mise à disposition, nécessaire pour les héberger, les adapter au format technique, les afficher et les distribuer dans l\'application. Vous garantissez disposer des droits nécessaires et restez responsable de vos publications et messages.</p>
        <p>L\'application, sa marque, son code, son interface, ses textes, ses bases de données et ses graphismes sont protégés par les droits applicables. Toute reproduction, modification, distribution ou exploitation non autorisée est interdite.</p>
        <h3>8. Signalement et modération</h3>
        <p>Tout utilisateur peut signaler un contenu ou un comportement illicite ou abusif par les moyens indiqués dans l\'application. Ag7Spot peut demander une correction, masquer ou retirer un contenu, limiter une fonctionnalité ou prendre toute autre mesure proportionnée.</p>
        <h3>9. Disponibilité et responsabilité</h3>
        <p>Ag7Spot met en œuvre des moyens raisonnables pour maintenir le service accessible, sans garantir une disponibilité continue, sans erreur ou compatible avec tous les appareils. Dans les limites autorisées par la loi, Ag7Spot ne répond pas des contenus de tiers, des transactions, des interruptions de réseau, de l\'usage de la géolocalisation ou du non-respect des consignes de sécurité.</p>
        <h3>10. Suspension et suppression du compte</h3>
        <p>Vous pouvez cesser d\'utiliser l\'application et demander la suppression de votre compte selon la procédure disponible. Ag7Spot peut suspendre ou supprimer un compte en cas de violation des présentes conditions, de fraude, de risque pour la sécurité, d\'obligation légale ou d\'usage abusif. La fermeture du compte ne supprime pas les obligations déjà nées ni celles qui doivent continuer à s\'appliquer.</p>
        <h3>11. Modification et règlement des différends</h3>
        <p>Ag7Spot peut faire évoluer ces conditions pour tenir compte du service, de la loi ou de la sécurité. En cas de modification substantielle, une nouvelle acceptation pourra être demandée. Les parties recherchent d\'abord une solution amiable à tout différend, sous réserve des droits impératifs du consommateur et des règles légales applicables.</p>
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
