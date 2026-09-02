function getOnboardingKey(userId = null) {
    const safeUserId = userId ?? (window.CURRENT_USER && window.CURRENT_USER.id) ?? null;
    return safeUserId ? `onboarding_done_${safeUserId}` : 'onboarding_done';
}

function shouldShowOnboardingForUser(userId = null) {
    const onboardingKey = getOnboardingKey(userId);
    if (localStorage.getItem(onboardingKey) === 'true') {
        return false;
    }
    if (localStorage.getItem('onboarding_done') === 'true') {
        return false;
    }
    return true;
}

function markOnboardingDone(userId = null) {
    const safeUserId = userId ?? (window.CURRENT_USER && window.CURRENT_USER.id) ?? null;
    const onboardingKey = getOnboardingKey(safeUserId);
    localStorage.setItem(onboardingKey, 'true');
    if (safeUserId) {
        localStorage.setItem('onboarding_done', 'true');
    }
    return true;
}

function completeOnboardingFlow(userId = null, categories = []) {
    const safeUserId = userId ?? (window.CURRENT_USER && window.CURRENT_USER.id) ?? null;
    markOnboardingDone(safeUserId);
    if (typeof saveUserCategories === 'function') {
        saveUserCategories(categories, safeUserId);
    }
    const onboardingModal = document.getElementById('onboardingModal');
    if (onboardingModal) {
        onboardingModal.classList.add('hidden');
    }
    if (typeof startAg7SpotTutorial === 'function') {
        setTimeout(() => {
            const activeModal = document.getElementById('onboardingModal');
            if (activeModal && !activeModal.classList.contains('hidden')) return;
            startAg7SpotTutorial();
        }, 300);
    }
    return true;
}

function renderOnboarding() {
    const categories = [
        { id: 'fashion', icon: 'fa-tshirt', label: 'Vêtements' },
        { id: 'food', icon: 'fa-utensils', label: 'Alimentation' },
        { id: 'tech', icon: 'fa-laptop', label: 'Électronique' },
        { id: 'books', icon: 'fa-book', label: 'Livres' },
        { id: 'beauty', icon: 'fa-spa', label: 'Beauté' },
        { id: 'sports', icon: 'fa-running', label: 'Sport' },
        { id: 'home', icon: 'fa-home', label: 'Décoration' },
        { id: 'toys', icon: 'fa-puzzle-piece', label: 'Jeux' }
    ];

    const onboardingContainer = document.getElementById('onboardingContainer');
    if (!onboardingContainer) return;

    onboardingContainer.innerHTML = `
        <div class="onboarding">
            <h2>Bienvenue sur Ag7Spot</h2>
            <p>Choisis les catégories qui t'intéressent :</p>
            <div class="category-grid">
                ${categories.map(cat => `
                    <div class="category-item" data-category="${cat.id}" onclick="toggleCategory(this)">
                        <i class="fas ${cat.icon}"></i>
                        <span>${cat.label}</span>
                    </div>
                `).join('')}
            </div>
            <button class="btn-primary" onclick="finishOnboarding()">
                <i class="fas fa-check"></i> Découvrir ma carte
            </button>
            <button class="btn-outline" onclick="skipOnboarding()">
                Passer
            </button>
        </div>
    `;
}

function toggleCategory(el) {
    if (!el) return;
    el.classList.toggle('selected');
}

async function finishOnboarding() {
    const selected = document.querySelectorAll('.category-item.selected');
    const categories = Array.from(selected).map(el => el.dataset.category);

    try {
        const pos = await getUserPosition();
        const userId = (window.CURRENT_USER && window.CURRENT_USER.id) || null;
        completeOnboardingFlow(userId, categories);

        const nearby = Array.isArray(SHOPS) ? SHOPS.filter(s => {
            const dist = getDistanceBetween(pos.lat, pos.lng, s.lat, s.lng);
            return dist <= 5 && categories.includes(s.category);
        }) : [];

        showToast(`Bienvenue ! ${nearby.length} boutiques autour de toi`, 'success');
        navigateTo('feed');
    } catch (e) {
        const userId = (window.CURRENT_USER && window.CURRENT_USER.id) || null;
        markOnboardingDone(userId);
        showToast('Erreur onboarding', 'error');
        navigateTo('feed');
    }
}

function skipOnboarding() {
    const userId = (window.CURRENT_USER && window.CURRENT_USER.id) || null;
    markOnboardingDone(userId);
    const onboardingModal = document.getElementById('onboardingModal');
    if (onboardingModal) {
        onboardingModal.classList.add('hidden');
    }
    if (typeof startAg7SpotTutorial === 'function') {
        setTimeout(() => {
            const modal = document.getElementById('onboardingModal');
            if (modal && !modal.classList.contains('hidden')) return;
            startAg7SpotTutorial();
        }, 300);
    }
    navigateTo('feed');
}