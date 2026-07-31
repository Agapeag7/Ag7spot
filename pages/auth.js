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
                        <label>Adresse e-mail</label>
                        <input type="email" id="authEmail" placeholder="exemple@domaine.com" required />
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
                    <div class="seller-section auth-register-field hidden">
                        <div class="section-block">
                            <h4>Informations de boutique</h4>
                            <div class="form-group">
                                <label>Nom de la boutique</label>
                                <input type="text" id="authShopName" placeholder="Ex: Boutique de Kin" />
                            </div>
                            <div class="form-group">
                                <label>Catégorie</label>
                                <input type="text" id="authShopCategory" placeholder="Ex: mode, food, tech" />
                            </div>
                            <div class="form-group">
                                <label>Adresse de la boutique</label>
                                <input type="text" id="authShopAddress" placeholder="Ex: Boulevard du 30 Juin" />
                            </div>
                            <div class="form-group">
                                <label>Position de la boutique</label>
                                <div id="authShopMap" class="auth-shop-map"></div>
                                <p class="map-hint">Déplace le marqueur pour placer la boutique exactement.</p>
                                <input type="hidden" id="authShopLat" />
                                <input type="hidden" id="authShopLng" />
                            </div>
                        </div>
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
    const registerFields = container.querySelectorAll('.auth-register-field');
    const sellerSection = container.querySelector('.seller-section');
    const submitBtn = container.querySelector('.auth-submit-btn');
    const loginNote = container.querySelector('.auth-note-login');
    const registerNote = container.querySelector('.auth-note-register');
    const authShopMap = container.querySelector('#authShopMap');
    const authShopLat = container.querySelector('#authShopLat');
    const authShopLng = container.querySelector('#authShopLng');
    const accountTypeSelect = container.querySelector('#authAccountType');
    const shopAddressInput = container.querySelector('#authShopAddress');

    let authMapInstance = null;
    let authShopMarker = null;
    let geocodeTimer = null;

    const geocodeShopAddress = async (address) => {
        const cleanAddress = (address || '').trim();
        if (!cleanAddress) return null;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleanAddress)}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return null;
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        } catch (error) {
            console.warn('Geocoding failed:', error);
            return null;
        }
    };

    const updateShopMarkerFromAddress = async () => {
        if (!authMapInstance || !authShopMarker || !shopAddressInput) return;
        const address = shopAddressInput.value.trim();
        if (!address) return;

        const coords = await geocodeShopAddress(address);
        if (!coords) return;

        authMapInstance.setView([coords.lat, coords.lng], 15);
        authShopMarker.setLatLng([coords.lat, coords.lng]);
        authShopLat.value = coords.lat.toFixed(4);
        authShopLng.value = coords.lng.toFixed(4);
    };

    const setMode = (mode) => {
        authForm.dataset.mode = mode;
        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        const isRegister = mode === 'register';
        registerFields.forEach(field => field.classList.toggle('hidden', !isRegister));
        if (sellerSection) {
            const isSeller = accountTypeSelect?.value === 'seller';
            sellerSection.classList.toggle('hidden', !isRegister || !isSeller);
        }
        submitBtn.innerHTML = isRegister ? '<i class="fas fa-user-plus"></i> Créer mon compte' : '<i class="fas fa-sign-in-alt"></i> Se connecter';
        loginNote.classList.toggle('hidden', isRegister);
        registerNote.classList.toggle('hidden', !isRegister);
    };

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    const updateSellerFields = () => {
        const isSeller = accountTypeSelect?.value === 'seller';
        if (sellerSection) {
            sellerSection.classList.toggle('hidden', !isSeller || authForm.dataset.mode !== 'register');
        }
        if (isSeller) {
            initializeAuthShopMap();
        }
    };

    accountTypeSelect?.addEventListener('change', updateSellerFields);

    const initializeAuthShopMap = async () => {
        if (!authShopMap || authMapInstance) return;

        try {
            const pos = await getUserPosition();
            const address = shopAddressInput?.value.trim();
            const geocoded = address ? await geocodeShopAddress(address) : null;
            const startLat = geocoded?.lat ?? pos?.lat ?? -4.3253;
            const startLng = geocoded?.lng ?? pos?.lng ?? 15.3135;

            authMapInstance = L.map(authShopMap, {
                zoomControl: true,
                attributionControl: false
            }).setView([startLat, startLng], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(authMapInstance);

            authShopMarker = L.marker([startLat, startLng], {
                draggable: true
            }).addTo(authMapInstance);

            authShopLat.value = startLat.toFixed(4);
            authShopLng.value = startLng.toFixed(4);

            authShopMarker.on('move', function(e) {
                const { lat, lng } = e.latlng;
                authShopLat.value = lat.toFixed(4);
                authShopLng.value = lng.toFixed(4);
            });

            shopAddressInput?.addEventListener('input', () => {
                clearTimeout(geocodeTimer);
                geocodeTimer = setTimeout(() => {
                    updateShopMarkerFromAddress();
                }, 700);
            });
        } catch (error) {
            console.warn('Initialisation carte boutique impossible:', error);
        }
    };

    setTimeout(updateSellerFields, 0);
    setMode('login');

    authForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const mode = authForm.dataset.mode;
        const email = container.querySelector('#authEmail').value.trim();
        const password = container.querySelector('#authPassword').value;

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

        const name = container.querySelector('#authName').value.trim();
        const confirmPassword = container.querySelector('#authConfirmPassword').value;
        const accountType = container.querySelector('#authAccountType').value;
        const privacyAccepted = container.querySelector('#authPrivacy').checked;

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

        const newUserId = Date.now();
        let shopId = null;
        if (accountType === 'seller') {
            const shopName = container.querySelector('#authShopName').value.trim();
            const shopCategory = container.querySelector('#authShopCategory').value.trim();
            const shopAddress = container.querySelector('#authShopAddress').value.trim();
            const shopLat = parseFloat(container.querySelector('#authShopLat').value);
            const shopLng = parseFloat(container.querySelector('#authShopLng').value);

            if (!shopName || !shopCategory || !shopAddress || Number.isNaN(shopLat) || Number.isNaN(shopLng)) {
                showToast('Remplis tous les champs de la boutique et déplace le marqueur sur la carte.', 'warning');
                return;
            }

            const newShop = {
                id: newUserId + 1,
                ownerId: newUserId,
                name: shopName,
                category: shopCategory,
                lat: shopLat,
                lng: shopLng,
                avatar: 'https://picsum.photos/seed/shop' + newUserId + '/100/100',
                cover: 'https://picsum.photos/seed/shop' + newUserId + '/600/300',
                followed: false,
                status: 'open',
                address: shopAddress
            };
            SHOPS.push(newShop);
            shopId = newShop.id;
        }

        const newUser = {
            id: newUserId,
            username: name,
            email,
            password,
            role: accountType,
            avatar: name.split(' ').map(part => part[0]?.toUpperCase()).join('').slice(0, 2),
            points: 0,
            shopId
        };

        if (shopId) {
            const shop = SHOPS.find(s => s.id === shopId);
            if (shop) {
                shop.ownerId = newUser.id;
            }
        }

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
