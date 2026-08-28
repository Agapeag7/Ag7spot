// =========================================
// DONNÉES SIMULÉES (remplacées par l'API plus tard)
// =========================================
// const SHOPS = [
//     { id: 1, ownerId: 1, name: "Urban Wear Kinshasa", category: "fashion", lat: -4.325321, lng: 15.313543, followed: true, status: 'open', address: 'Avenue de la Paix, Gombe, Kinshasa' },
//     { id: 2, ownerId: 2, name: "Librairie du Fleuve", category: "books", lat: -4.327650, lng: 15.305930, followed: false, status: 'open', address: 'Boulevard du 30 Juin, Kinshasa' },
//     { id: 3, ownerId: 3, name: "ElectroTech Matadi", category: "tech", lat: -5.826872, lng: 13.456220, followed: true, status: 'break', address: 'Avenue Molayi, Matadi' },
//     { id: 4, ownerId: 4, name: "Boulangerie Kisangani", category: "food", lat: 0.517245, lng: 25.191949, followed: false, status: 'open', address: 'Rue du Commerce, Kisangani' },
//     { id: 5, ownerId: 5, name: "Beauty Kin", category: "beauty", lat: -4.395400, lng: 15.267800, followed: false, status: 'closed', address: 'Quartier Lingwala, Kinshasa' }
// ];

const PRODUCTS = [
    { id: 101, shopId: 1, name: "Sweat Oversize X", price: 49.99, image: "https://source.unsplash.com/400x400/?congo,african-fashion", stock: 12, distance: 1.2 },
    { id: 102, shopId: 1, name: "Jeans Vintage Coupe", price: 69.00, image: "https://source.unsplash.com/400x400/?congo,africa,street-style", stock: 3, distance: 1.2 },
    { id: 103, shopId: 1, name: "Casquette Edition Limitee", price: 29.99, image: "https://source.unsplash.com/400x400/?congo,african-accessories", stock: 0, distance: 1.2 },
    { id: 201, shopId: 2, name: "L'Etranger - Albert Camus", price: 12.90, image: "https://source.unsplash.com/400x400/?congo,african-bookstore", stock: 8, distance: 0.8 },
    { id: 301, shopId: 3, name: "Ecouteurs ANC Pro", price: 89.00, image: "https://source.unsplash.com/400x400/?congo,african-technology", stock: 5, distance: 2.5 },
    { id: 302, shopId: 3, name: "Station de charge rapide", price: 34.99, image: "https://source.unsplash.com/400x400/?congo,african-electronics", stock: 2, distance: 2.5 },
    { id: 401, shopId: 4, name: "Pain au chocolat (x6)", price: 8.50, image: "https://source.unsplash.com/400x400/?congo,african-bakery", stock: 20, distance: 0.4 },
    { id: 501, shopId: 5, name: "Crème hydratante bio", price: 24.90, image: "https://source.unsplash.com/400x400/?congo,african-beauty", stock: 7, distance: 1.8 }
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