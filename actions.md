ALGORITHME DE RECOMMANDATION DES PUBLICATIONS SUR LE FIL D’ACTUS

Objectif
- personnaliser le fil d’actualités pour chaque utilisateur selon ses centres d’intérêt, ses interactions et sa proximité géographique.
- prioriser les produits/boutiques qui ont le plus de chance d’être cliqués, suivis ou réservés.
- rester simple à mettre en œuvre dans le code actuel, sans casser la logique de feed / carte / boutique.

Principe général
- chaque publication (produit affiché dans le fil) reçoit un score de pertinence calculé à partir de plusieurs signaux.
- le fil trie les éléments par score décroissant, puis par récence décroissante.
- l’utilisateur voit en premier les contenus les plus compatibles avec son profil, tout en gardant une fraîcheur suffisante.

Données à collecter
1. Données utilisateur
- catégories préférées (depuis l’onboarding)
- boutiques suivies
- produits consultés / ouverts
- messages envoyés / réservations
- interactions de type follow, click, open, view time
- historique de parcours des boutiques visitées

2. Données publication
- shop_id
- product_id
- nom, catégorie, prix, stock
- boutique propriétaire
- distance utilisateur -> boutique
- date de création / mise à jour
- popularité globale du produit (clics, réservations, suivis)
- statut de la boutique (open / break / closed)
- présence de deal / promo

3. Données contextuelles
- position utilisateur actuelle
- rayon de proximité (ex. 5 km)
- heure / jour
- historique d’interactions récents (ex. 30 derniers jours)

Signaux de recommandation
A. Pertinence thématique
- si le produit appartient à une catégorie déjà préférée par l’utilisateur, bonus fort
- si la boutique est dans une catégorie déjà suivie, bonus moyen
- si l’utilisateur a déjà réservé / consulté des produits similaires, bonus moyen

B. Engagement utilisateur
- clic sur un produit, réservation ou ouverture du détail -> score positif
- suivi de boutique -> boost pour les produits de cette boutique
- temps de lecture / lecture complète -> bonus
- panier ou message envoyé -> bonus fort

C. Popularité locale
- boutique très active dans le rayon
- produit souvent réservé / consulté près de l’utilisateur
- tendance locale sur les produits de la même catégorie

D. Distance / proximité
- plus la boutique est proche, plus le score augmente
- on peut utiliser une courbe décroissante : plus la distance augmente, moins le score est fort

E. Récence
- produit récent = bonus de fraîcheur
- ancien produit sans activité = déclin progressif

F. Disponibilité / conversion
- stock disponible : bonus
- produit escompté / flash deal : bonus
- boutique fermée : pénalité

Scoring proposé (moteur simple)
score =
  35 * thématique
+ 20 * engagement_utilisateur
+ 20 * popularité_locale
+ 15 * proximité
+ 10 * récence
+ 10 * disponibilité
+ 10 * boutique_followed
- 15 * boutique_fermée

Chaque composant peut être calculé sur une échelle de 0 à 1, puis multiplié par un poids.

Exemple de formule concrète
- thématique = 1 si catégorie préférée, 0.5 si similaire, 0 sinon
- engagement_utilisateur = score moyen de relation utilisateur -> boutique ou catégorie
- popularité_locale = nombre de clics / réservations / suivis sur la boutique dans le rayon
- proximité = 1 - (distance / rayon_max)
- récence = min(1, age_en_jours / 7) inverse ou score décroissant avec l’ancienneté
- disponibilité = 1 si stock > 0, 0 si stock = 0
- boutique_followed = 1 si shop suivi, 0 sinon
- boutique_fermée = 1 si boutique fermée, 0 sinon

Règles d’implémentation côté projet
1. Stockage local des préférences utilisateur
- créer un profil utilisateur avec :
  - preferred_categories: []
  - followed_shops: []
  - viewed_products: []
  - recent_interactions: [{type, product_id, shop_id, category, timestamp, weight}]
  - click_history, reservation_history, follow_history

- conserver ces données dans localStorage ou dans un futur stockage serveur

2. Fil d’actualité
- côté feed.js, calculer un score pour chaque élément avant de le rendre
- trier `feedState.allItems` avec `sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at))`
- afficher les éléments les plus pertinents en premier

3. Points d’intégration
- le feed actuel charge déjà une liste de produits (`feedState.allItems`)
- la logique peut être ajoutée à l’étape “après récupération des données, avant rendu”
- on peut aussi enrichir chaque élément avec des champs calculés :
  - `score`
  - `match_reason`
  - `category_match`
  - `is_followed_shop`
  - `distance_score`

4. Logique “personnalisation” sans bulle trop forte
- limiter les catégories trop dominantes pour éviter une sur-personnalisation oppressive
- garder un mélange de contenus populaires / proches / récents / hors préférences
- ajouter un léger facteur d’exploration, ex. 10% de contenu hors profil

5. Moteur de recommandation minimaliste, évolutif
- première version : règles manuelles / score pondéré
- version ultérieure : système basé sur historique + apprentissage simple
- objectif actuel : avoir un comportement utile sans dépendre d’un modèle externe

Plan de mise en œuvre (dans l’ordre)
1. Sauvegarder les préférences utilisateur dans le stockage local
2. Ajouter les interactions utilisateur (clic produit, follow boutique, réservation, vue détaillée)
3. Calculer le score de chaque produit dans le feed
4. Trier le feed selon le score
5. Ajouter des indicateurs de match dans l’UI (optionnel)
6. Vérifier le comportement sur les profils de test :
   - utilisateur avec marques préférées
   - utilisateur qui suit des boutiques
   - utilisateur qui réserve souvent
   - utilisateur sans historique

Cas d’usage à couvrir
- un utilisateur suit une boutique mode -> les produits de cette boutique montent dans le feed
- un utilisateur consulte beaucoup de produits de catégorie tech -> les produits tech prennent du poids
- un produit récent et proche doit passer devant un ancien produit lointain
- si l’utilisateur n’a pas de données, le feed reste équilibré et basé sur proximité + récence

Pistes d’implémentation concrète
- ajouter dans `services/storage.js` ou un objet dédié :
  `saveUserPreferences(userId, preferences)`
  `loadUserPreferences(userId)`
  `recordUserInteraction(type, product, shop, category)`

- dans `pages/feed.js` :
  `scoreFeedItems(items, currentUser, userPosition)`
  `buildRecommendationContext(currentUser)`

- calculs de distance à partir de `getDistanceBetween(...)`
- utilisation des catégories déjà stockées à l’onboarding

Proposition de priorité
- priorité 1 : score basé sur proximité + préférences + boutiques suivies
- priorité 2 : popularité locale + récence
- priorité 3 : variété et exploration

Critères de succès
- le fil affiche d’abord les produits les plus proches et les plus cohérents avec les préférences
- l’utilisateur voit encore des produits hors profil pour rester explorateur
- les produits populaires mais non proches restent visibles, sans dominer tout le feed

Recommandation finale
- implémenter une version “weighted ranking” dès maintenant, car elle est simple, fiable, visible immédiatement, et s’intègre parfaitement au projet actuel sans dépendre d’un back-end complexe.
- la prochaine étape technique sera d’écrire la logique dans `services/storage.js` + `pages/feed.js`, puis valider le rendu sur un profil utilisateur exemple.
  