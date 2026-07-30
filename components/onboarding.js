// =========================================
// COMPOSANT : ONBOARDING "À LA TINDER"
// =========================================
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

    document.getElementById('onboardingContainer').innerHTML = `
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
    el.classList.toggle('selected');
}

async function finishOnboarding() {
    const selected = document.querySelectorAll('.category-item.selected');
    const categories = Array.from(selected).map(el => el.dataset.category);

    try {
        const pos = await getUserPosition();
        // Envoyer les préférences (simulé)
        localStorage.setItem('onboarding_done', 'true');
        localStorage.setItem('user_categories', JSON.stringify(categories));

        // Charger les boutiques recommandées
        const nearby = SHOPS.filter(s => {
            const dist = getDistanceBetween(pos.lat, pos.lng, s.lat, s.lng);
            return dist <= 5 && categories.includes(s.category);
        });

        document.getElementById('onboardingModal').classList.add('hidden');
        showToast(`Bienvenue ! ${nearby.length} boutiques autour de toi`, 'success');
        navigateTo('feed');
    } catch (e) {
        showToast('Erreur onboarding', 'error');
    }
}

function skipOnboarding() {
    localStorage.setItem('onboarding_done', 'true');
    document.getElementById('onboardingModal').classList.add('hidden');
    navigateTo('feed');
}