# Dictionnaire des données

## 1. SHOPS
Source : `data/mock-data.js`

Champs principaux :
- `id` : nombre (identifiant de la boutique)
- `ownerId` : nombre (référence `USERS.id`)
- `name` : string
- `category` : string
- `lat` / `lng` : nombre (coordonnées GPS)
- `followed` : booléen
- `status` : string (`open`, `closed`, `break`)
- `address` : string

Utilisation :
- `pages/map.js` : affichage des marqueurs, filtres de recherche, popup boutique, sélection parcours
- `pages/feed.js` : recherche produit / boutique, distance, statut
- `pages/add-product.js` : choisir boutique existante pour ajout produit, création boutique
- `pages/profile.js` : afficher la boutique du vendeur
- `pages/collections.js` : construction de collections et parcours de collection
- `pages/favorites.js` : liste et gestion des boutiques suivies
- `pages/chat.js` : information de boutique pour précommande
- `components/shop-status.js` : affichage état boutique

---

## 2. PRODUCTS
Source : `data/mock-data.js`

Champs principaux :
- `id` : nombre (identifiant produit)
- `shopId` : nombre (référence `SHOPS.id`)
- `name` : string
- `price` : nombre
- `image` : string (URL)
- `stock` : nombre
- `distance` : nombre (distance affichée depuis la boutique)

Champs additionnels dans les créations dynamiques :
- `description` : string (ajouté par `pages/add-product.js`)

Utilisation :
- `pages/feed.js` : fil d’actualité produit, filtre par distance et requête
- `pages/map.js` : popup boutique, liste produits par boutique
- `pages/add-product.js` : ajout de nouveau produit
- `pages/profile.js` : calcul du nombre de produits du vendeur
- `pages/chat.js` : précommande, informations produit
- `components/flash-deal.js` : affichage du deal lié au produit

---

## 3. FLASH_DEALS
Source : `data/mock-data.js`

Champs :
- `id` : nombre
- `shopId` : nombre
- `productId` : nombre
- `discount` : nombre (pourcentage)
- `endTime` : string ISO datetime

Utilisation :
- `pages/map.js` : popup boutique, affichage flash deals
- `components/flash-deal.js` : rendu des offres flash
- `services/api.js` : `getFlashDeals()` pour récupérer les deals à proximité

---

## 4. USERS
Source : `data/mock-data.js`

Champs :
- `id` : nombre
- `username` : string
- `email` : string
- `password` : string
- `role` : string (`seller` ou `buyer`)
- `avatar` : string
- `points` : nombre
- `shopId` : nombre ou `null`

Utilisation :
- `pages/auth.js` : authentification
- `app.js` : chargement utilisateur depuis `localStorage`
- `pages/profile.js` : profil et rôle
- `pages/add-product.js` : accès réservé aux vendeurs
- `pages/collections.js` : `creator` de collection est un `USERS.id`
- `services/api.js` : potentielle base pour auth/CRUD futures

---

## 5. COLLECTIONS
Source : `data/mock-data.js`

Champs :
- `id` : nombre
- `name` : string
- `description` : string
- `shops` : tableau de `shopId`
- `creator` : nombre (`USERS.id`)

Utilisation :
- `pages/map.js` : affichage de marqueurs de collection et parcours
- `pages/collections.js` : affichage et création de collections
- `pages/parcours.js` : démarrage de parcours via collection

---

## 6. CURRENT_USER
Source : `data/mock-data.js` + `pages/auth.js` + `app.js`

Champs :
- `id` : nombre ou `null`
- `username` : string
- `points` : nombre
- `avatar` : string
- `shopId` : nombre ou `null`
- `role` : string (`buyer` par défaut)

Utilisation :
- `app.js` : garde l’état de l’utilisateur connecté
- `pages/auth.js` : sauvegarde/chargement `localStorage`
- `pages/add-product.js` : validation rôle vendeur
- `pages/profile.js` : affichage profil, actions vendeur/acheteur
- `pages/collections.js` : `creator` d’une collection
- `pages/map.js` : check-in, interaction utilisateur

---

## 7. routeWaypoints
Source : `pages/parcours.js`

Structure :
- tableau d’objets `{ lat, lng, name }`

Utilisation :
- `pages/map.js` : marque les boutiques ajoutées au parcours
- `pages/parcours.js` : construction du parcours, calcul de route, navigation Google Maps

---

## 8. userPosition
Source : `services/geolocation.js`

Structure :
- `{ lat, lng, accuracy }`

Utilisation :
- `getUserPosition()`
- `pages/map.js` : recentrage, calcul de distance
- `pages/feed.js` : filtrage par rayon
- `pages/parcours.js` : point de départ du parcours
- `pages/add-product.js` : préremplissage coordonnées boutique

---

## 9. localStorage
Clés observées :
- `ag7_current_user` : utilisateur connecté
- `ag7_onboarding_done` : flag onboarding
- `offline_map_downloaded` : carte offline
- `offline_tiles_downloaded` : tiles offline
- `use_mock` : fallback API mock
- `user_categories` : catégories choisies lors de l’onboarding

---

## Services principaux

### services/api.js
Fonctions :
- `apiCall(endpoint, method, data)` : wrapper fetch JSON vers `/backend/api`
- `getNearbyShops(lat, lng, radius, categories)`
- `getShopProducts(shopId)`
- `getFeed(lat, lng, maxDistance)`
- `addProduct(productData)`
- `updateStock(productId, newStock)`
- `calculateRoute(waypoints, mode)`
- `getFlashDeals(lat, lng, radius)`
- `checkIn(shopId)`
- `getCollections()`
- `createCollection(name, description, shopIds)`
- `sendMessage(shopId, productId, content)`
- `getMessages(shopId)`
- `updateShopStatus(shopId, status)`
- `followShop(shopId)`
- `unfollowShop(shopId)`
- `useMockData()`

---

### services/geolocation.js
Fonctions :
- `getUserPosition()`
- `watchUserPosition(callback)`
- `stopWatching()`
- `getDistanceBetween(lat1, lng1, lat2, lng2)`
- `isNearShop(shopLat, shopLng, thresholdKm)`

---

## Composants utilitaires

### components/shop-status.js
- `renderShopStatus(shop)` : retourne un badge HTML selon `shop.status`
- `updateShopStatus(shopId, status)` : met à jour le statut côté mock/API

### components/flash-deal.js
- `renderFlashDeals(deals)` : génère l’UI des offres flash
- `getTimeLeft(endTime)` : calcul temps restant
- `loadNearbyDeals()` : essaye d’appeler l’API, fallback `FLASH_DEALS`

---

## Pages et entités utilisées

- `pages/auth.js` : `USERS`, `CURRENT_USER`
- `pages/feed.js` : `PRODUCTS`, `SHOPS`, `getUserPosition`, `getDistanceBetween`, `renderShopStatus`, `renderStockBadge`, `openChat`
- `pages/map.js` : `SHOPS`, `PRODUCTS`, `FLASH_DEALS`, `COLLECTIONS`, `routeWaypoints`, `getUserPosition`, `getDistanceBetween`, `showToast`, `navigateTo`
- `pages/add-product.js` : `CURRENT_USER`, `SHOPS`, `PRODUCTS`
- `pages/profile.js` : `CURRENT_USER`, `SHOPS`, `PRODUCTS`, `renderShopStatus`
- `pages/collections.js` : `COLLECTIONS`, `SHOPS`, `CURRENT_USER`
- `pages/chat.js` : `PRODUCTS`, `SHOPS`, `sendMessage`, `getMessages`
- `pages/parcours.js` : `SHOPS`, `getUserPosition`, `getDistanceBetween`, `routeWaypoints`
- `pages/favorites.js` : `SHOPS`, `renderShopStatus`

---

## Résumé
Le cœur du modèle est :
- `SHOPS` + `PRODUCTS` pour le marché,
- `USERS` + `CURRENT_USER` pour auth et rôle buyer/seller,
- `COLLECTIONS` pour parcours thématiques,
- `FLASH_DEALS` pour promotions,
- `routeWaypoints` pour l’itinéraire multi-boutiques.

