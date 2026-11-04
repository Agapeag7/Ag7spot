# Analyse des abonnes et des notifications

| Abonnements | Relation utilisateur/boutique dans `shop_follows`, mais favoris geres localement dans le front | En theorie `shop_follows`, en pratique `SHOPS[].followed` sur certaines pages |
| Notifications | Icone et libelle de parametre seulement; aucun flux fonctionnel | Aucune |

Le point important est de separer les faits deja implementes des regles metier encore a definir. Le front affiche parfois un etat qui n'est pas persiste, tandis que le back-end contient des tables ou requetes qui ne sont pas presentes dans le script SQL fourni.

## 3. Abonnes et boutiques suivies

### Fonctionnement actuel

La table `shop_follows` modelise correctement une relation plusieurs-a-plusieurs:

- `user_id` identifie l'abonne;
- `shop_id` identifie la boutique suivie;
- `created_at` date l'abonnement;
- la contrainte unique `(user_id, shop_id)` empeche le doublon;
- les cles etrangeres suppriment la relation si l'utilisateur ou la boutique est supprime.

`backend/api/follow.php` expose `POST` pour suivre et `DELETE` pour ne plus suivre. L'identite vient de la session. `SpotFollows` utilise `INSERT IGNORE`, puis `DELETE`, et `profile.php` renvoie seulement `followCount`.

Le probleme vient de la lecture front-end. `pages/favorites.js` filtre `SHOPS` sur `shop.followed`, inverse ce booleen dans `toggleFollow()` et recharge l'ecran, mais n'appelle ni `followShop()` ni `unfollowShop()`. Cette modification est donc locale et disparait au rechargement. En parallele, `shops.followed` est une colonne globale: elle ne peut pas representer un etat different pour chaque utilisateur.

### Logique cible

`shop_follows` doit etre l'unique source de verite pour savoir si l'utilisateur courant suit une boutique. La colonne `shops.followed` devrait etre supprimee ou ignoree.

Le GET des boutiques doit joindre la relation de l'utilisateur courant, par exemple avec un `LEFT JOIN shop_follows ...`, et retourner un booleen `followed` calcule pour cette session. Le bouton du front doit:

1. appeler l'API `POST` ou `DELETE`;
2. attendre la reponse;
3. modifier `SHOPS[].followed` seulement si la requete a reussi;
4. reafficher la liste;
5. afficher une erreur sans perdre l'etat precedent en cas d'echec.

L'abonnement est aussi le declencheur naturel de notifications: les actions comme modifier boutique ou ajout d'un nouveau produit doivent etre distribues uniquement aux utilisateurs possedant une ligne correspondante dans `shop_follows`.


## 4. Notifications

### Fonctionnement et configuration Web Push

Les notifications applicatives sont conservees dans `notifications`. Pour les afficher dans la barre Android lorsque le site est en arriere-plan ou ferme, le navigateur doit en plus s'abonner au push depuis le profil. Le service worker `sw.js` affiche les alertes et ouvre leur destination au toucher. Les abonnements sont lies a la session utilisateur et supprimes lors de la deconnexion.

Le serveur doit etre accessible en HTTPS (sauf localhost), disposer de PHP avec Composer et installer la dependance du projet:

```sh
composer install
```

Generer une paire VAPID avec `Minishlink\WebPush\VAPID::createVapidKeys()` puis configurer cote serveur, sans committer les secrets:

```text
VAPID_PUBLIC_KEY=<cle publique base64url>
VAPID_PRIVATE_KEY=<cle privee>
VAPID_SUBJECT=mailto:admin@votre-domaine.tld
```

Apres deploiement, ouvrir le site dans Chrome sur Android, se connecter, puis choisir « Activer sur ce téléphone » dans Profil > Notifications. L'utilisateur doit accepter la demande du navigateur. Les alertes ne peuvent pas etre forcees si la permission est refusee ou si les notifications du site sont bloquees dans Android.

`backend/api/push.php` enregistre uniquement les abonnements authentifies et `SpotNotifications` relaie les evenements metier a ces abonnements. Si les cles ou la dependance manquent, l'activation est signalee comme indisponible; les notifications restent conservees dans l'application.

## 5. Corrections prioritaires

1. Brancher `pages/favorites.js` sur `follow.php` et calculer `followed` par utilisateur dans l'API des boutiques.
2. Supprimer ou deprecier `shops.followed`, qui est un etat global incoherent.
3. Ajouter `notifications`, ses endpoints authentifies et les evenements lies aux boutiques suivies.
4. Corriger la reinitialisation SQL pour supprimer `shop_follows`, `checkins` et les nouvelles tables avant recreation.
5. Ajouter des tests d'integration: session absente, boutique fermee, distance invalide, rollback SQL, suivi persiste et notification reservee au bon abonné.

## 6. Resume de la logique metier

Un utilisateur authentifié peut suivre une boutique. Ce suivi est stocké dans `shop_follows`. Lorsqu'une boutique suivie publie un produit, une offre ou un changement important, chaque abonné reçoit une notification persistante, eventuellement relayee en push. Le solde, le suivi et les notifications doivent tous être decidés par le serveur et seulement reflettés par le navigateur.










# Analyse des points

1. Ajouter `checkins` au SQL, ainsi que les cles et contraintes necessaires.
2. Refuser le check-in sans session et supprimer le fallback `data.user_id`.
3. Mettre le check-in, le mouvement de points et la mise a jour du solde dans une transaction.
4. Ajouter `point_transactions` avant d'implementer une depense ou une recompense.
5. Ajouter une regle anti-duplicata et refaire la validation de distance cote serveur.



## 1. Vue d'ensemble

Le projet contient trois mecanismes qui se croisent mais qui ne sont pas encore relies de bout en bout:

| Domaine | Etat actuel | Source de verite |
| --- | --- | --- |
| Points | Un compteur dans `users.points`; seul le check-in credite des points | Base de donnees, puis `CURRENT_USER.points` cote navigateur |


Le point important est de separer les faits deja implementes des regles metier encore a definir. Le front affiche parfois un etat qui n'est pas persiste, tandis que le back-end contient des tables ou requetes qui ne sont pas presentes dans le script SQL fourni.

## 2. Gestion des points

### Fonctionnement actuel

Le solde est stocke dans la colonne `users.points`, de type entier, avec une valeur initiale de `0`.

Le parcours de check-in est le suivant:

1. `pages/map.js` recupere la position GPS.
2. Le navigateur verifie une precision maximale de 100 m, une distance de moins de 100 m de la boutique et le statut `open`.
3. `services/api.js` appelle `backend/api/checkin.php`.
4. `checkin.php` appelle `SpotCheckins::registerCheckin()` dans `backend/spot.class.php`.
5. Le serveur verifie que la boutique existe et est ouverte.
6. Une ligne est inseree dans `checkins`, puis `users.points` est augmente de `10`.
7. La reponse contient le nouveau solde et le nombre total de check-ins.
8. `pages/map.js` met a jour `CURRENT_USER.points` et affiche `Check-in valide ! +10 points`.

La methode `SpotUsers::updatePoints()` existe egalement et additionne une valeur arbitraire au compteur, mais elle n'est pas appelee par les parcours actuellement identifies. Il n'existe pas d'endpoint pour depenser des points, acheter une recompense ou consulter un historique.

### Problemes et risques

- La table `checkins` est utilisee par `SpotCheckins`, mais elle n'apparait pas dans `bdd/spotbdd.sql`. Une installation depuis ce script ne peut donc pas executer le check-in correctement.
- Le controle GPS est uniquement cote navigateur. Le serveur ne recoit ni latitude, ni longitude, ni precision et ne peut donc pas verifier la distance.
- `backend/api/checkin.php` utilise `user_id` fourni dans le JSON si aucune session n'est ouverte. Un client peut ainsi tenter de crediter le compte d'un autre utilisateur. Le serveur doit refuser toute requete sans session et prendre exclusivement `$_SESSION['user_id']`.
- Le check-in et le credit de 10 points sont deux requetes distinctes, sans transaction. Une panne entre les deux peut creer un check-in sans credit, ou un etat partiel.
- Aucun delai ou unicite n'empeche plusieurs check-ins consecutifs dans la meme boutique. Il faut choisir une regle, par exemple un seul gain par boutique et par jour.
- `users.points` est un compteur sans origine, reference metier ni journal. Il est impossible d'expliquer ou d'auditer le solde.
- `updatePoints()` accepte une valeur negative sans verifier le solde. Une future depense pourrait donc rendre le solde negatif.
- Le localStorage peut contenir un ancien solde. La reponse serveur ou `profile.php` doit rester la reference apres connexion et apres chaque operation.

### Modele recommande

Ajouter une table de mouvements, par exemple `point_transactions`:

```text
id, user_id, amount, type, reference_type, reference_id, created_at
```

`amount` est positif pour un gain et negatif pour une depense. Les types peuvent etre `checkin`, `reward`, `manual_adjustment` et `refund`. Chaque operation doit etre realisee dans une transaction SQL:

1. verifier l'utilisateur, la reference et les regles d'eligibilite;
2. verrouiller le solde (`SELECT ... FOR UPDATE`);
3. refuser une depense superieure au solde;
4. inserer le mouvement;
5. mettre a jour `users.points`;
6. valider la transaction.

Le check-in devrait recevoir et valider cote serveur la position, la precision et la distance calculee depuis les coordonnees de `shops`. La contrainte anti-duplicata doit etre imposee en base ou dans une transaction, pas seulement dans le JavaScript.
