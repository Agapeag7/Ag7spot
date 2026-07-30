// =========================================
// DONNÉES SIMULÉES (remplacées par l'API plus tard)
// =========================================
const SHOPS = [
    { id: 1, ownerId: 1, name: "Urban Wear Lyon", category: "fashion", lat: 45.7640, lng: 4.8357, avatar: "https://picsum.photos/seed/urban/100/100", cover: "https://picsum.photos/seed/urban/600/300", followed: true, status: 'open', address: '15 Rue de la République, Lyon' },
    { id: 2, ownerId: 2, name: "Librairie du Coin", category: "books", lat: 45.7580, lng: 4.8450, avatar: "https://picsum.photos/seed/librairie/100/100", cover: "https://picsum.photos/seed/librairie/600/300", followed: false, status: 'open', address: '8 Place des Terreaux, Lyon' },
    { id: 3, ownerId: 3, name: "ElectroShop Pro", category: "tech", lat: 45.7700, lng: 4.8250, avatar: "https://picsum.photos/seed/electro/100/100", cover: "https://picsum.photos/seed/electro/600/300", followed: true, status: 'break', address: '42 Rue Garibaldi, Lyon' },
    { id: 4, ownerId: 4, name: "Boulangerie des Artisans", category: "food", lat: 45.7550, lng: 4.8600, avatar: "https://picsum.photos/seed/boulangerie/100/100", cover: "https://picsum.photos/seed/boulangerie/600/300", followed: false, status: 'open', address: '3 Rue Tête d\'Or, Lyon' },
    { id: 5, ownerId: 5, name: "Beauty & Co", category: "beauty", lat: 45.7620, lng: 4.8500, avatar: "https://picsum.photos/seed/beauty/100/100", cover: "https://picsum.photos/seed/beauty/600/300", followed: false, status: 'closed', address: '10 Rue Victor Hugo, Lyon' }
];

const PRODUCTS = [
    { id: 101, shopId: 1, name: "Sweat Oversize X", price: 49.99, image: "https://picsum.photos/seed/sweat1/400/400", stock: 12, distance: 1.2 },
    { id: 102, shopId: 1, name: "Jeans Vintage Coupe", price: 69.00, image: "https://picsum.photos/seed/jeans1/400/400", stock: 3, distance: 1.2 },
    { id: 103, shopId: 1, name: "Casquette Edition Limitee", price: 29.99, image: "https://picsum.photos/seed/casquette/400/400", stock: 0, distance: 1.2 },
    { id: 201, shopId: 2, name: "L'Etranger - Albert Camus", price: 12.90, image: "https://picsum.photos/seed/livre1/400/400", stock: 8, distance: 0.8 },
    { id: 301, shopId: 3, name: "Ecouteurs ANC Pro", price: 89.00, image: "https://picsum.photos/seed/ecouteurs/400/400", stock: 5, distance: 2.5 },
    { id: 302, shopId: 3, name: "Station de charge rapide", price: 34.99, image: "https://picsum.photos/seed/charge/400/400", stock: 2, distance: 2.5 },
    { id: 401, shopId: 4, name: "Pain au chocolat (x6)", price: 8.50, image: "https://picsum.photos/seed/pain/400/400", stock: 20, distance: 0.4 },
    { id: 501, shopId: 5, name: "Crème hydratante bio", price: 24.90, image: "https://picsum.photos/seed/creme/400/400", stock: 7, distance: 1.8 }
];

const FLASH_DEALS = [
    { id: 1, shopId: 1, productId: 101, discount: 30, endTime: '2026-07-30T14:00:00' },
    { id: 2, shopId: 3, productId: 301, discount: 20, endTime: '2026-07-30T16:00:00' }
];

const USERS = [
    { id: 1, username: 'Ag7 Dev', email: 'ag7@dev.com', password: 'password123', role: 'seller', avatar: 'AG', points: 450, shopId: 1 },
    { id: 2, username: 'Lina Achete', email: 'lina@achete.com', password: 'acheteur123', role: 'buyer', avatar: 'LA', points: 120, shopId: null },
    { id: 3, username: 'Tech Vendeur', email: 'tech@vendeur.com', password: 'vendeur123', role: 'seller', avatar: 'TV', points: 230, shopId: 3 }
];

const COLLECTIONS = [
    { id: 1, name: "Mode Vintage à Lyon", description: "Les meilleures adresses pour du vintage", shops: [1, 5], creator: 1 },
    { id: 2, name: "Petit-déjeuner gourmand", description: "Boulangeries et café de quartier", shops: [4], creator: 2 }
];

const CURRENT_USER = { id: null, username: '', points: 0, avatar: '', shopId: null, role: 'buyer' };

// Distance helper
function calculateDistance(pos1, pos2) {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}