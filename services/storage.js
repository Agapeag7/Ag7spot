// =========================================
// STORAGE / PREFERENCES / RECOMMANDATION
// =========================================

function getRecommendationStorageKey(userId = null) {
    const baseId = userId ? Number(userId) : 'guest';
    return `ag7_recommendations_${baseId}`;
}

function getRecommendationProfile(userId = null) {
    const key = getRecommendationStorageKey(userId);
    const raw = localStorage.getItem(key);

    if (!raw) {
        return {
            preferred_categories: [],
            followed_shops: [],
            recent_interactions: [],
            stats: {
                views: 0,
                reservations: 0,
                follows: 0,
                clicks: 0
            },
            updated_at: null
        };
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            preferred_categories: Array.isArray(parsed.preferred_categories) ? parsed.preferred_categories : [],
            followed_shops: Array.isArray(parsed.followed_shops) ? parsed.followed_shops.map(Number) : [],
            recent_interactions: Array.isArray(parsed.recent_interactions) ? parsed.recent_interactions : [],
            stats: parsed.stats || { views: 0, reservations: 0, follows: 0, clicks: 0 },
            updated_at: parsed.updated_at || null
        };
    } catch (e) {
        return {
            preferred_categories: [],
            followed_shops: [],
            recent_interactions: [],
            stats: { views: 0, reservations: 0, follows: 0, clicks: 0 },
            updated_at: null
        };
    }
}

function saveRecommendationProfile(profile, userId = null) {
    const key = getRecommendationStorageKey(userId);
    const safeProfile = {
        preferred_categories: Array.isArray(profile.preferred_categories) ? profile.preferred_categories : [],
        followed_shops: Array.isArray(profile.followed_shops) ? profile.followed_shops.map(Number) : [],
        recent_interactions: Array.isArray(profile.recent_interactions) ? profile.recent_interactions : [],
        stats: profile.stats || { views: 0, reservations: 0, follows: 0, clicks: 0 },
        updated_at: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(safeProfile));
    return safeProfile;
}

function normalizeCategory(category) {
    if (!category) return '';
    return String(category).trim().toLowerCase();
}

function loadUserCategories(userId = null) {
    const profile = getRecommendationProfile(userId);
    return profile.preferred_categories || [];
}

function saveUserCategories(categories, userId = null) {
    const profile = getRecommendationProfile(userId);
    profile.preferred_categories = Array.isArray(categories)
        ? categories.map(normalizeCategory).filter(Boolean)
        : [];
    return saveRecommendationProfile(profile, userId);
}

function addFollowedShop(shopId, userId = null) {
    const profile = getRecommendationProfile(userId);
    const cleanId = Number(shopId);
    if (!cleanId) return profile;
    if (!profile.followed_shops.includes(cleanId)) {
        profile.followed_shops.push(cleanId);
    }
    return saveRecommendationProfile(profile, userId);
}

function removeFollowedShop(shopId, userId = null) {
    const profile = getRecommendationProfile(userId);
    profile.followed_shops = profile.followed_shops.filter(id => Number(id) !== Number(shopId));
    return saveRecommendationProfile(profile, userId);
}

function recordUserInteraction(type, payload = {}, userId = null) {
    const profile = getRecommendationProfile(userId);
    const productId = payload.product_id != null ? Number(payload.product_id) : null;
    const shopId = payload.shop_id != null ? Number(payload.shop_id) : null;
    const category = normalizeCategory(payload.category || payload.shop_category || '');

    const weightMap = {
        view_product: 1,
        click_product: 2,
        reserve_product: 4,
        follow_shop: 3,
        open_chat: 2,
        view_detail: 1
    };

    const event = {
        type,
        product_id: productId,
        shop_id: shopId,
        category,
        weight: weightMap[type] || 1,
        timestamp: new Date().toISOString()
    };

    profile.recent_interactions = [event, ...profile.recent_interactions].slice(0, 200);

    if (type === 'follow_shop' && shopId) {
        profile.followed_shops = Array.from(new Set([...(profile.followed_shops || []), shopId]));
        profile.stats.follows = (profile.stats.follows || 0) + 1;
    }

    if (type === 'reserve_product') {
        profile.stats.reservations = (profile.stats.reservations || 0) + 1;
    }

    if (type === 'view_product' || type === 'click_product' || type === 'view_detail') {
        profile.stats.views = (profile.stats.views || 0) + 1;
    }

    if (type === 'click_product' || type === 'open_chat') {
        profile.stats.clicks = (profile.stats.clicks || 0) + 1;
    }

    if (category) {
        const existing = profile.preferred_categories || [];
        if (!existing.includes(category)) {
            profile.preferred_categories = [...existing, category].slice(0, 10);
        }
    }

    return saveRecommendationProfile(profile, userId);
}

function getRecentInteractionScore(profile, product = null, shopId = null, category = null) {
    if (!profile || !Array.isArray(profile.recent_interactions)) return 0;

    const now = Date.now();
    const windowMs = 30 * 24 * 60 * 60 * 1000;

    return profile.recent_interactions.reduce((sum, interaction) => {
        if (!interaction || !interaction.timestamp) return sum;
        const ts = Date.parse(interaction.timestamp);
        if (Number.isNaN(ts) || now - ts > windowMs) return sum;

        let match = 0;
        if (product && interaction.product_id && Number(interaction.product_id) === Number(product.id)) match += 1;
        if (shopId && interaction.shop_id && Number(interaction.shop_id) === Number(shopId)) match += 1;
        if (category && interaction.category && normalizeCategory(interaction.category) === normalizeCategory(category)) match += 0.5;

        if (match > 0) return sum + (interaction.weight || 1) * match;
        return sum;
    }, 0);
}

window.getRecommendationProfile = getRecommendationProfile;
window.saveRecommendationProfile = saveRecommendationProfile;
window.loadUserCategories = loadUserCategories;
window.saveUserCategories = saveUserCategories;
window.recordUserInteraction = recordUserInteraction;
window.addFollowedShop = addFollowedShop;
window.removeFollowedShop = removeFollowedShop;
