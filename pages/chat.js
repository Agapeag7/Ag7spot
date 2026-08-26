// =========================================
// PAGE : CHAT / PRÉ-COMMANDE
// =========================================
let currentChatShop = null;
let currentChatProduct = null;

async function openChat(productId) {
    let product;
    let shop;
    try {
        product = await getProduct(productId);
        if (!product) throw new Error('Produit introuvable.');
        shop = await getShop(product.shop_id);
        if (!shop) throw new Error('Boutique introuvable.');
    } catch (error) {
        showToast(error.message || 'Impossible d’ouvrir la réservation.', 'error');
        return;
    }

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
            <div class="message system">${product.name} - ${parseFloat(product.price).toFixed(2)} $</div>
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

    // Envoyer via API
    try {
        const result = await sendMessage(currentChatShop.id, currentChatProduct.id, message);
        if (result && result.success) {
            addChatMessage('Vous', message, 'sent');
            showToast('Message envoyé à la boutique.', 'success');
        } else {
            throw new Error('Le message n’a pas pu être envoyé.');
        }
    } catch (e) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        showToast('Erreur d\'envoi', 'error');
    }
}

function addChatMessage(sender, message, type) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const senderElement = document.createElement('strong');
    senderElement.textContent = `${sender}:`;
    div.appendChild(senderElement);
    div.appendChild(document.createTextNode(` ${message}`));
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function loadChatMessages(shopId) {
    try {
        const messages = await getMessages(shopId);
        const container = document.getElementById('chatMessages');
        if (!container) return;
        container.innerHTML = '';
        messages.forEach(msg => {
            const isCurrentUser = Number(msg.sender_id) === Number(CURRENT_USER.id);
            const type = isCurrentUser ? 'sent' : 'received';
            const sender = isCurrentUser ? 'Vous' : 'Boutique';
            addChatMessage(sender, msg.content, type);
        });
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        console.warn('Impossible de charger les messages', e);
    }
}

// Exposer pour les appels
window.openChat = openChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;