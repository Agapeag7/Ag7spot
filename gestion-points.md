Je vais suivre les flux existants de points, abonnements, publications et notifications, puis confronter ces éléments au contenu actuel de `gestion-points.md`. Comme la session est en mode planification, je vais documenter une proposition précise dans le plan sans modifier encore le fichier de travail.

L’analyse montre un écart important à rendre explicite dans le document : les points et les relations d’abonnement existent côté base/API, mais les notifications n’existent pas encore et l’interface de suivi reste principalement en mémoire. 

Le plan existant confirme l’analyse technique mais contenait une ancienne décision de lecture seule. 
Je le mets à jour pour refléter la demande actuelle : préparer la réécriture de `gestion-points.md`, tout en distinguant clairement les fonctionnalités livrées, partielles et absentes.

## Plan : Documenter Points et Abonnements

L’application possède une logique partielle :

- Les **Points** sont stockés dans `users.points` et crédités lors d’un check-in valide, généralement à hauteur de 10 points.
- Les conditions du check-in sont contrôlées dans `map.js` : boutique ouverte, GPS précis et distance maximale de 100 m.
- Les **abonnements** disposent d’une table `shop_follows`, d’une logique PHP et d’une API.
- L’interface frontend ne persiste toutefois pas réellement les abonnements : `toggleFollow()` modifie principalement l’état en mémoire.
- Les **notifications aux abonnés lors d’un nouveau produit ne sont pas implémentées**. Il n’existe ni table, ni endpoint, ni mécanisme Push.
- Le schéma SQL ne contient pas non plus la table `checkins`, pourtant utilisée par le backend.

**Rédaction prévue dans** `gestion-points.md` :

1. Fonctionnement réel des Points.
2. Conditions et limites des check-ins.
3. Fonctionnement backend des abonnements.
4. Écart entre l’API et l’interface utilisateur.
5. Publication des produits.
6. État réel des notifications.
7. Liste des fonctionnalités manquantes et des fichiers concernés.

**Fichiers de référence :**

- `spotbdd.sql`
- `spot.class.php`
- `checkin.php`
- `follow.php`
- `map.js`
- `favorites.js`
- `api.js`
- `profile.js`

Le plan est enregistré dans `/memories/session/plan.md`. La prochaine étape est la réécriture effective de `gestion-points.md` après validation du plan.