<?php
$isLocalHost = preg_match('/^(localhost|127\.0\.0\.1|\[::1\]|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})(:\d+)?$/', $_SERVER['HTTP_HOST']);
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] === 443;
if (!$isLocalHost && !$isHttps) {
    $httpsUrl = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('Location: ' . $httpsUrl);
    exit;
}
?>
<!DOCTYPE html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        <link rel="icon" type="image/png" href="ico/spot.png" />
        <link rel="apple-touch-icon" href="ico/spot.png" />

        <title>Ag7Spot - Trouve près de chez toi</title>

        <!-- Polices & Icônes -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <!-- Leaflet CSS (carte) -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

        <!-- Notre CSS -->
        <link rel="stylesheet" href="style.css" />
    </head>
    <body>

        <div id="app">
            <!-- ===== HEADER ===== -->
            <header class="app-header">
                <div class="logo">
                    <img src="ico/spot.png" alt="Ag7Spot" class="app-icon" />
                    <span>Ag7Spot</span>
                </div>
                <div class="header-actions">
                    <i class="fas fa-search" id="searchIcon" title="Recherche"></i>
                    <span class="notification-trigger">
                        <i class="fas fa-bell" id="notifIcon" title="Notifications"></i>
                        <span class="badge hidden" id="notifBadge"></span>
                    </span>
                </div>
            </header>

            <!-- ===== CONTENU PRINCIPAL ===== -->
            <main class="main-content" id="mainContent">
                <!-- Les pages sont injectées dynamiquement par JavaScript -->
                <div id="pageContainer"></div>
            </main>

            <!-- ===== NAVIGATION BASSE ===== -->
            <nav class="bottom-nav">
                <button class="nav-item active" data-page="feed">
                    <i class="fas fa-newspaper"></i>
                    <span>Fil</span>
                </button>
                <button class="nav-item" data-page="map">
                    <i class="fas fa-map"></i>
                    <span>Carte</span>
                    <span class="badge" id="dealBadge"></span>
                </button>
                <button class="nav-item nav-center" data-page="add">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="nav-item" data-page="favorites">
                    <i class="fas fa-heart"></i>
                    <span>Suivis</span>
                </button>
                <button class="nav-item" data-page="profile">
                    <i class="fas fa-user"></i>
                    <span>Profil</span>
                </button>
            </nav>

            <!-- ===== CONTENEUR POUR LES TOASTS ===== -->
            <div id="toastContainer"></div>

            <!-- ===== MODALE POUR LE CHAT ===== -->
            <div id="chatModal" class="modal hidden">
                <div class="modal-content">
                    <div id="chatContainer"></div>
                </div>
            </div>

            <!-- ===== MODALE ONBOARDING ===== -->
            <div id="onboardingModal" class="modal hidden">
                <div class="modal-content onboarding-modal">
                    <div id="onboardingContainer"></div>
                </div>
            </div>

            <!-- ===== MODALE DE CONFIRMATION DE SUPPRESSION ===== -->
            <div id="deleteProductModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="deleteProductTitle">
                <div class="modal-content delete-product-modal">
                    <button class="modal-close" type="button" aria-label="Fermer" onclick="closeDeleteProductModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="delete-product-icon"><i class="fas fa-trash"></i></div>
                    <h3 id="deleteProductTitle">Supprimer ce produit ?</h3>
                    <p id="deleteProductMessage">Cette action est définitive.</p>
                    <div class="modal-actions">
                        <button class="btn-outline" type="button" onclick="closeDeleteProductModal()">Annuler</button>
                        <button id="confirmDeleteProductButton" class="btn-danger" type="button" onclick="confirmDeleteProduct()">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <!-- ===== MODALE D'EDITION DE PRODUIT ===== -->
            <div id="editProductModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="editProductTitle">
                <div class="modal-content edit-product-modal">
                    <button class="modal-close" type="button" aria-label="Fermer" onclick="closeEditProductModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3 id="editProductTitle">Modifier le produit</h3>
                    <form id="editProductForm" onsubmit="confirmEditProduct(event)">
                        <div class="form-group">
                            <label for="editProductName">Nom du produit</label>
                            <input id="editProductName" type="text" required maxlength="150" />
                        </div>
                        <div class="form-group">
                            <label for="editProductPrice">Prix ($)</label>
                            <input id="editProductPrice" type="number" min="0.01" step="0.01" required />
                        </div>
                        <div class="form-group">
                            <label for="editProductStock">Quantité en stock</label>
                            <input id="editProductStock" type="number" min="0" step="1" required />
                        </div>
                        <div class="form-group">
                            <label for="editProductDescription">Description</label>
                            <textarea id="editProductDescription"></textarea>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-outline" type="button" onclick="closeEditProductModal()">Annuler</button>
                            <button id="confirmEditProductButton" class="btn-primary" type="submit">
                                <i class="fas fa-save"></i> Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="shopEditModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="shopEditTitle">
                <div class="modal-content edit-product-modal">
                    <button class="modal-close" type="button" aria-label="Fermer" onclick="closeShopEditor()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3 id="shopEditTitle">Modifier ma boutique</h3>
                    <form onsubmit="submitShopEditor(event)">
                        <input id="editShopId" type="hidden" />
                        <div class="form-group">
                            <label for="editShopName">Nom de la boutique</label>
                            <input id="editShopName" type="text" maxlength="150" required />
                        </div>
                        <div class="form-group">
                            <label for="editShopCategory">Catégorie</label>
                            <select id="editShopCategory" required>
                                <option value="fashion">Vêtements et chaussures</option>
                                <option value="home">Maison et déco</option>
                                <option value="tech">High-tech et électronique</option>
                                <option value="beauty">Santé et beauté</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Position sur la carte</label>
                            <div id="editShopMap" class="shop-create-map"></div>
                            <input id="editShopLat" type="hidden" />
                            <input id="editShopLng" type="hidden" />
                        </div>
                        <div class="modal-actions">
                            <button class="btn-outline" type="button" onclick="closeShopEditor()">Annuler</button>
                            <button id="saveShopEditorButton" class="btn-primary" type="submit"><i class="fas fa-save"></i> Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ===== SCRIPTS ===== -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

        <!-- Services -->
        <script src="services/storage.js"></script>
        <script src="services/geolocation.js"></script>
        <script src="services/api.js"></script>
        <script src="services/search.js"></script>
        <script src="services/offline.js"></script>

        <!-- Données (mock) -->
        <script src="data/mock-data.js"></script>

        <!-- Composants -->
        <script src="components/stock-badge.js"></script>
        <script src="components/shop-status.js"></script>
        <script src="components/flash-deal.js"></script>
        <script src="components/onboarding.js"></script>

        <!-- Pages -->
        <script src="pages/feed.js"></script>
        <script src="pages/map.js"></script>
        <script src="pages/shop-or-product.js"></script>
        <script src="pages/favorites.js"></script>
        <script src="pages/profile.js"></script>
        <script src="pages/parcours.js"></script>
        <script src="pages/collections.js"></script>
        <script src="pages/chat.js"></script>
        <script src="pages/auth.js"></script>

        <!-- App principale -->
        <script src="app.js"></script>
    </body>
</html>