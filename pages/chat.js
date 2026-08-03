// =========================================
// PAGE : CHAT / PRÉ-COMMANDE
// =========================================
let currentChatShop = null;
let currentChatProduct = null;

function openChat(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const shop = SHOPS.find(s => s.id === product.shopId);
    if (!shop) return;

    currentChatProduct = product;
    currentChatShop = shop;

    const modal = document.getElementById('chatModal');
    const container = document.getElementById('chatContainer');

    container.innerHTML = `
        <div class="chat-header">
            <i class="fas fa-store" style="color:var(--primary);"></i>
            <strong>${shop.name}</strong>
            ${renderShopStatus(shop)}
            <button onclick="closeChat()"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message system">${product.name} - ${product.price.toFixed(2)} $</div>
            <div class="message system">Envoie un message pour réserver</div>
        </div>
        <div class="chat-input">
            <input type="text" id="chatInput" placeholder="Ex: Je viens dans 30 min, gardez ce pull en M" />
            <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;

    modal.classList.remove('hidden');

    // Focus input
    document.getElementById('chatInput').focus();

    // Enter pour envoyer
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Charger les anciens messages
    loadChatMessages(shop.id);
}

function closeChat() {
    document.getElementById('chatModal').classList.add('hidden');
    currentChatShop = null;
    currentChatProduct = null;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message || !currentChatShop || !currentChatProduct) return;

    input.value = '';

    // Ajouter le message dans l'UI
    addChatMessage('Vous', message, 'sent');

    // Envoyer via API
    try {
        const result = await sendMessage(currentChatShop.id, currentChatProduct.id, message);
        // Simuler une réponse du commerçant
        setTimeout(() => {
            if (Math.random() > 0.3) {
                addChatMessage('Boutique', '✅ Commande réservée ! On vous attend.', 'received');
                showToast('✅ Pré-commande acceptée !', 'success');
            } else {
                addChatMessage('Boutique', '❌ Désolé, plus disponible.', 'received');
                showToast('❌ Pré-commande refusée', 'error');
            }
        }, 1500 + Math.random() * 1000);
    } catch (e) {
        showToast('Erreur d\'envoi', 'error');
    }
}

function addChatMessage(sender, message, type) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function loadChatMessages(shopId) {
    try {
        const messages = await getMessages(shopId);
        const container = document.getElementById('chatMessages');
        if (!container) return;
        container.innerHTML = messages.map(msg => {
            const type = msg.sender_id === CURRENT_USER.id ? 'sent' : 'received';
            const sender = msg.sender_id === CURRENT_USER.id ? 'Vous' : 'Boutique';
            return `<div class="message ${type}"><strong>${sender}:</strong> ${msg.content}</div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.warn('Impossible de charger les messages', e);
    }
}

// Exposer pour les appels
window.openChat = openChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;