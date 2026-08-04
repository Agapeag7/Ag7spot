// =========================================
// API SERVICE (Appels AJAX vers le back-end PHP)
// =========================================
const API_BASE = './backend/api';

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur serveur');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message || 'Erreur de connexion', 'error');
        throw error;
    }
}

// Endpoints spécifiques
function getNearbyShops(lat, lng, radius = 5, categories = []) {
    const params = new URLSearchParams({ lat, lng, radius, categories: categories.join(',') });
    return apiCall(`shops.php?${params.toString()}`).then(response => response.shops || []);
}

function getShopProducts(shopId) {
    return apiCall(`products.php?shop_id=${shopId}`).then(response => response.products || []);
}

function getFeed(lat, lng, maxDistance = 5) {
    const params = new URLSearchParams({ lat, lng, max_distance: maxDistance });
    return apiCall(`feed.php?${params.toString()}`).then(response => response.feed || []);
}

function createShop(shopData) {
    return apiCall('shops.php', 'POST', shopData).then(response => response.shop_id || null);
}

function addProduct(productData) {
    return apiCall('products.php', 'POST', productData).then(response => response.product_id || null);
}

function updateStock(productId, newStock) {
    return apiCall('products.php', 'PUT', { product_id: productId, stock: newStock });
}

function calculateRoute(waypoints, mode = 'walking') {
    return apiCall('route.php', 'POST', { waypoints, mode });
}

function auth(action, payload) {
    return apiCall('auth.php', 'POST', Object.assign({ action }, payload));
}

function login(username, password) {
    return auth('login', { username, password });
}

function register(name, email, password, role) {
    return auth('register', { name, email, password, role });
}

function logoutApi() {
    return apiCall('logout.php', 'POST');
}

function getFlashDeals(lat, lng, radius = 2) {
    const params = new URLSearchParams({ lat, lng, radius });
    return apiCall(`flashdeals.php?${params.toString()}`).then(response => response.deals || []);
}

function checkIn(shopId) {
    return apiCall('checkin.php', 'POST', { shop_id: shopId }).then(response => response);
}

function getCollections() {
    return apiCall('collections.php').then(response => response.collections || []);
}

function createCollection(name, description, shopIds) {
    return apiCall('collections.php', 'POST', { name, description, shops: shopIds }).then(response => response.collection_id || null);
}

function sendMessage(shopId, productId, content) {
    return apiCall('messages.php', 'POST', { shop_id: shopId, product_id: productId, content });
}

function getMessages(shopId) {
    return apiCall(`messages.php?shop_id=${shopId}`).then(response => response.messages || []);
}

function updateShopStatus(shopId, status) {
    return apiCall('shops.php', 'PUT', { shop_id: shopId, status });
}

function followShop(shopId) {
    return apiCall('follow.php', 'POST', { shop_id: shopId });
}

function unfollowShop(shopId) {
    return apiCall('follow.php', 'DELETE', { shop_id: shopId });
}

// Mock fallback pour le développement (si l'API n'est pas prête)
function useMockData() {
    return localStorage.getItem('use_mock') === 'true';
}

// Toast helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}