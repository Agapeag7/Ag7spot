// =========================================
// COMPOSANT : BADGE DE STOCK
// =========================================
function renderStockBadge(product) {
    if (product.stock <= 0) {
        return `<span class="stock-badge out-of-stock"><i class="fas fa-times-circle"></i> Rupture</span>`;
    } else if (product.stock <= 3) {
        return `<span class="stock-badge last-items"><i class="fas fa-exclamation-triangle"></i> Dernière pièce</span>`;
    } else {
        return `<span class="stock-badge available"><i class="fas fa-check-circle"></i> ${product.stock} en rayon</span>`;
    }
}

// Mise à jour du stock (appel AJAX)
async function updateStock(productId, newStock) {
    try {
        const result = await apiCall('products.php', 'PUT', { product_id: productId, stock: newStock });
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            showToast(`Stock mis à jour : ${newStock} unités`, 'success');
        }
        return result;
    } catch (e) {
        showToast('Erreur mise à jour stock', 'error');
    }
}