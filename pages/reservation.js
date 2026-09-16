// =========================================
// PAGE : RESERVATION
// =========================================
let currentChatShop = null;
let currentChatProduct = null;

function buildReservationMessage(message) {
    const product = currentChatProduct;
    const shop = currentChatShop;
    return `${message}\n \nProduit : ${product.name} \n Prix : ${parseFloat(product.price).toFixed(2)} $ \n Boutique : ${shop.name}`;
}

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
    if (!modal || !container) return;

    container.innerHTML = `
        <div class="chat-header">
            <i class="fas fa-store" style="color:var(--primary);"></i>
            <strong>${shop.name}</strong>
            ${renderShopStatus(shop)}
            <button onclick="closeChat()"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message system">Envoie un message pour réserver</div>
        </div>
        <div class="chat-input">
            <div class="chat-reply-preview">
                <i class="fas fa-reply"></i>
                <div>
                    <strong>Réservation</strong>
                    <span>${product.name} · ${parseFloat(product.price).toFixed(2)} $</span>
                    <small>${shop.address || 'Adresse non renseignée'} · ${shop.lat}, ${shop.lng}</small>
                </div>
            </div>
            <div class="chat-input-row">
                <input type="text" id="chatInput" placeholder="Ex: Je viens dans 30 min, gardez ce pull en M" />
                <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    const input = document.getElementById('chatInput');
    input.focus();
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') sendChatMessage();
    });
    loadChatMessages(shop.id);
}

function closeChat() {
    const modal = document.getElementById('chatModal');
    if (modal) modal.classList.add('hidden');
    currentChatShop = null;
    currentChatProduct = null;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    if (!message || !currentChatShop || !currentChatProduct) return;
    input.value = '';
    try {
        const content = buildReservationMessage(message);
        const result = await sendMessage(currentChatShop.id, currentChatProduct.id, content);
        if (!result || !result.success) throw new Error('Le message n’a pas pu être envoyé.');
        addChatMessage('Vous', content, 'sent');
        showToast('Message envoyé à la boutique.', 'success');
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        showToast('Erreur d\'envoi', 'error');
    }
}

function addChatMessage(sender, message, type) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
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
        messages.forEach(message => {
            const isCurrentUser = Number(message.sender_id) === Number(CURRENT_USER.id);
            addChatMessage(isCurrentUser ? 'Vous' : 'Boutique', message.content, isCurrentUser ? 'sent' : 'received');
        });
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        if (typeof window !== 'undefined' && window.sessionClearingInProgress) return;
        console.warn('Impossible de charger les messages', error);
    }
}

window.openChat = openChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;