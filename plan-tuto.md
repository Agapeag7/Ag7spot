# Plan exact du tutoriel Ag7Spot

## Objectif

Mettre en place un tutoriel guidé lors de la première utilisation de l’application pour expliquer les fonctions clés de Ag7Spot :
- recherche rapide,
- notifications,
- navigation entre pages,
- filtrage du fil,
- carte et parcours,
- ajout de boutique/produit,
- profil vendeur.

Le tutoriel doit s’afficher uniquement la première fois pour un utilisateur connecté, puis être mémorisé dans le navigateur pour ne plus se relancer.

---

## Règle de déclenchement

Le tutoriel doit être déclenché après un utilisateur authentifié et après les écrans de login/onboarding initiaux.

Pseudo-règle :
- si l’utilisateur est connecté,
- si le tutoriel n’a pas déjà été vu,
- et si la page actuelle est compatible (feed, map, profile, add),
- alors lancer le parcours.

Stockage local :
- `localStorage.setItem('ag7spot_tutorial_done_' + userId, 'true')`
- fallback si aucun id utilisateur : `localStorage.setItem('ag7spot_tutorial_done', 'true')`

---

## Éléments ciblés dans l’UI réelle

### 1) Header / actions rapides
- `#searchIcon` : icône de recherche du header
- `#notificationTrigger` : zone des notifications

### 2) Navigation principale
- `.nav-item[data-page="feed"]`
- `.nav-item[data-page="map"]`
- `.nav-item.nav-center[data-page="add"]`
- `.nav-item[data-page="favorites"]`
- `.nav-item[data-page="profile"]`

### 3) Fil d’actualité
- `#feedSearchInput`
- `#distanceRange`
- `#distanceValue`

### 4) Carte
- `#searchMap`
- `#routeBtn`
- `#locateBtn`

### 5) Ajout / boutique / produit
- `#shopName`
- `#shopCategory`
- `#productName`
- `#productPrice`
- `#fileInput`

### 6) Profil vendeur
- `#sellerProductsSearchInput`
- `.shop-status-toggle[data-status="open"]`
- `.shop-status-toggle[data-status="closed"]`
- `.shop-status-toggle[data-status="break"]`

---

## Séquence du tutoriel recommandé

### Étape 1 — Rechercher un produit ou une boutique
Cible : `#searchIcon`
Texte :
> Rechercher rapidement un produit ou une boutique près de toi.

But : expliquer l’accès au champ de recherche du fil.

### Étape 2 — Consulter les notifications
Cible : `#notificationTrigger`
Texte :
> Regarde ici les nouveaux messages, mises à jour et alertes importantes.

But : informer l’utilisateur de l’onglet notifications.

### Étape 3 — Naviguer dans l’application
Cible : `.nav-item[data-page="map"]`
Texte :
> Explore la carte pour voir les boutiques les plus proches de ta position.

Puis pointer vers `.nav-item[data-page="favorites"]` ou `.nav-item[data-page="profile"]` :
> Retrouve tes boutiques suivies et accède à ton profil depuis ici.

### Étape 4 — Filtrer les résultats
Cible : `#distanceRange`
Texte :
> Ajuste la distance pour afficher seulement les offres à proximité.

Puis cible : `#feedSearchInput`
Texte :
> Utilise la recherche pour trouver un produit ou une boutique en particulier.

### Étape 5 — Ajouter une boutique ou un produit
Cible : `.nav-item.nav-center[data-page="add"]`
Texte :
> Ajoute ici ta boutique ou un produit à vendre.

### Étape 6 — La carte et le parcours
Cible : `#searchMap`
Texte :
> Cherche une boutique directement depuis la carte.

Puis cible : `#routeBtn`
Texte :
> Crée un parcours pour organiser ta visite de plusieurs boutiques.

### Étape 7 — Profil vendeur
Cible : `.nav-item[data-page="profile"]`
Texte :
> Depuis ton profil, tu peux gérer tes produits, ton statut boutique et tes paramètres.

---

## Schéma de configuration exact (Intro.js)

```js
function startAg7SpotTutorial() {
    const userId = window.CURRENT_USER && window.CURRENT_USER.id ? window.CURRENT_USER.id : null;
    const key = userId ? `ag7spot_tutorial_done_${userId}` : 'ag7spot_tutorial_done';

    if (localStorage.getItem(key) === 'true') {
        return;
    }

    const steps = [
        {
            element: '#searchIcon',
            intro: 'Rechercher rapidement un produit ou une boutique près de toi.'
        },
        {
            element: '#notificationTrigger',
            intro: 'Regarde ici les nouveaux messages, mises à jour et alertes importantes.'
        },
        {
            element: '.nav-item[data-page="map"]',
            intro: 'Explore la carte pour voir les boutiques les plus proches de ta position.'
        },
        {
            element: '#distanceRange',
            intro: 'Ajuste la distance pour filtrer les offres à proximité.'
        },
        {
            element: '#feedSearchInput',
            intro: 'Utilise la recherche pour trouver un produit ou une boutique en particulier.'
        },
        {
            element: '.nav-item.nav-center[data-page="add"]',
            intro: 'Ajoute ici ta boutique ou un produit à vendre.'
        },
        {
            element: '#routeBtn',
            intro: 'Crée un parcours pour organiser ta visite de plusieurs boutiques.'
        },
        {
            element: '.nav-item[data-page="profile"]',
            intro: 'Depuis ton profil, tu peux gérer tes produits, ton statut boutique et tes paramètres.'
        }
    ];

    introJs().setOptions({
        steps,
        nextLabel: 'Suivant',
        prevLabel: 'Retour',
        skipLabel: 'Passer',
        doneLabel: 'Terminer',
        exitOnOverlayClick: false
    }).oncomplete(() => {
        localStorage.setItem(key, 'true');
    }).onexit(() => {
        localStorage.setItem(key, 'true');
    }).start();
}
```

---

## Point d’intégration dans l’application

Le plus propre est de lancer le tutoriel dans le `DOMContentLoaded` principal, après l’authentification réussie et après la première page affichée.

Exemple d’ordre exact :
1. charger l’utilisateur,
2. vérifier s’il est connecté,
3. afficher la page de départ (`feed`, `map`, `profile`, etc.),
4. appeler `startAg7SpotTutorial();`.

À éviter :
- démarrer le tutoriel avant que le DOM du header ne soit présent,
- le lancer pendant le modal onboarding,
- le relancer à chaque navigation.

---

## Variante compatible avec Driver.js

Si l’équipe préfère Driver.js, la structure reste identique avec des éléments ciblés et une séquence logique.

```js
function startAg7SpotTutorialDriver() {
    const driver = window.driver({
        showProgress: true,
        steps: [
            { element: '#searchIcon', popover: { title: 'Recherche', description: 'Rechercher rapidement un produit ou une boutique près de toi.' } },
            { element: '#notificationTrigger', popover: { title: 'Notifications', description: 'Regarde ici les nouveaux messages, mises à jour et alertes importantes.' } },
            { element: '.nav-item[data-page="map"]', popover: { title: 'Carte', description: 'Explore la carte pour voir les boutiques les plus proches de ta position.' } },
            { element: '#distanceRange', popover: { title: 'Distance', description: 'Ajuste la distance pour filtrer les offres à proximité.' } },
            { element: '.nav-item.nav-center[data-page="add"]', popover: { title: 'Créer', description: 'Ajoute ici ta boutique ou un produit à vendre.' } },
            { element: '.nav-item[data-page="profile"]', popover: { title: 'Profil', description: 'Gère tes produits, ton statut boutique et tes paramètres.' } }
        ]
    });

    driver.drive();
}
```

---

## Résumé court

Le tutoriel Ag7Spot doit être un parcours de 6 à 8 étapes, priorisant les éléments les plus utiles au démarrage :
- recherche,
- notifications,
- carte,
- filtrage du fil,
- ajout,
- profil.

L’objectif est de former l’utilisateur en moins de 30 secondes sans le submerger, tout en gardant une logique cohérente avec l’expérience réelle de l’application.
