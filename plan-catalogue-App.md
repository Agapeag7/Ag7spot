# Catalogue fonctionnel de l'application Ag7Spot

## 1. Présentation de l'application

Ag7Spot est une application mobile-first de découverte du commerce local. Elle met en relation les utilisateurs avec les boutiques et les produits situés autour de leur position.

L'application permet de :

- découvrir les produits et les boutiques proches ;
- rechercher une boutique ou un produit ;
- consulter les boutiques sur une carte interactive ;
- suivre ses boutiques préférées ;
- envoyer un message à une boutique pour réserver ou demander un produit ;
- consulter les offres flash et les disponibilités ;
- créer un parcours de visite entre plusieurs boutiques ;
- effectuer un check-in dans une boutique proche ;
- créer une boutique et publier des produits pour un compte vendeur ;
- recevoir des notifications liées aux messages, produits et boutiques ;
- utiliser certaines ressources mises en cache en mode hors-ligne.

Ag7Spot fonctionne autour de la proximité géographique : la position de l'utilisateur sert à filtrer le fil d'actualité, afficher les boutiques proches et construire les itinéraires.

## 2. Publics et rôles

### Acheteur

L'acheteur consulte les offres, recherche des boutiques, suit ses enseignes favorites, réserve un produit par message, effectue un check-in et construit des parcours de visite.

### Vendeur

Le vendeur possède toutes les fonctions de l'acheteur et peut en plus créer une boutique, publier des produits, modifier ses produits, supprimer ses produits et changer le statut de sa boutique.

## 3. Structure générale de l'interface

### En-tête

| Contrôle | Fonction |
|---|---|
| Logo Ag7Spot | Identifie l'application. Il ne déclenche pas d'action particulière dans l'interface actuelle. |
| Icône Recherche | Affiche ou masque la recherche du fil d'actualité. Le champ est automatiquement sélectionné lorsqu'il apparaît. La touche `Échap` ferme la recherche et réinitialise le filtre. |
| Icône Cloche | Ouvre le panneau des notifications pour un utilisateur connecté. Le badge indique le nombre de notifications non lues, avec une limite d'affichage à `99+`. |
| Badge de notifications | Indicateur visuel uniquement. Il disparaît lorsqu'il n'y a plus de notification non lue. |

### Navigation basse

| Bouton | Fonction |
|---|---|
| Fil | Ouvre le fil d'actualité personnalisé avec les produits proches. |
| Carte | Ouvre la carte des boutiques et affiche éventuellement le nombre de boutiques proches. |
| Bouton central `+` | Ouvre l'espace d'ajout. Pour un vendeur avec boutique, il ouvre le formulaire d'ajout de produit. Pour un vendeur sans boutique, il permet de créer une boutique. |
| Suivis | Affiche les boutiques suivies par l'utilisateur. |
| Profil | Ouvre le profil, les statistiques, les réglages et les fonctions vendeur. |

La navigation basse est masquée lorsque l'utilisateur n'est pas connecté.

## 4. Connexion et création de compte

### Boutons

| Bouton | Fonction |
|---|---|
| Connexion | Active le mode de connexion et masque les champs propres à l'inscription. |
| Créer un compte | Active le mode inscription et affiche le type de compte, la confirmation du mot de passe et l'acceptation des conditions. |
| Se connecter | Envoie les identifiants au serveur. En cas de succès, l'utilisateur arrive sur le fil. |
| Créer mon compte | Envoie le formulaire d'inscription. Le compte est créé uniquement si les validations sont respectées. |
| Retour | Revient vers l'écran d'authentification depuis la politique de confidentialité ou les conditions d'utilisation. |

### Champs de connexion et d'inscription

| Champ | Fonction et règles |
|---|---|
| Nom d'utilisateur | Identifiant utilisé pour la connexion et l'inscription. En inscription, le nom peut recevoir automatiquement un suffixe numérique pour respecter l'unicité. |
| Mot de passe | Mot de passe du compte. À l'inscription, il doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial. |
| Confirmer le mot de passe | Vérifie que le mot de passe d'inscription a été saisi correctement une deuxième fois. |
| Type de compte | Sélection entre `Acheteur` et `Vendeur`. |
| Se souvenir de moi | Conserve la session utilisateur selon le comportement prévu par l'authentification. Cette case est cochée par défaut. |
| J'accepte la politique... | Autorise la création du compte après acceptation de la politique de confidentialité et des conditions d'utilisation. |
| Politique de confidentialité | Ouvre la page expliquant les données collectées, leur utilisation, leur protection et les droits de l'utilisateur. |
| Conditions d'utilisation | Ouvre la page présentant les règles d'utilisation, les obligations, la sécurité et les limites de responsabilité. |

## 5. Première utilisation et onboarding

Après la création du compte, Ag7Spot peut afficher un écran de bienvenue.

| Contrôle | Fonction |
|---|---|
| Catégories de centres d'intérêt | Chaque tuile sélectionne ou désélectionne une catégorie : vêtements, alimentation, électronique, livres, beauté, sport, décoration ou jeux. |
| Découvrir ma carte | Enregistre les catégories choisies, estime les boutiques proches et ouvre le fil d'actualité. |
| Passer | Ignore la sélection des catégories et ouvre directement le fil. |
| Fermer le tutoriel | Termine le tutoriel guidé de l'application et enregistre son état pour l'utilisateur. |
| Étape suivante du tutoriel | Passe au contrôle présenté dans l'étape suivante. |
| Étape précédente du tutoriel | Revient au contrôle présenté dans l'étape précédente, lorsque cette action est disponible. |

Le tutoriel présente successivement la recherche, les notifications, la carte, la distance, l'ajout, le parcours et le profil.

## 6. Fil d'actualité

Le fil affiche les produits disponibles autour de l'utilisateur. Le classement tient compte notamment de la catégorie, de la proximité, de la récence, de la popularité et des boutiques suivies.

### Champs et filtres

| Contrôle | Fonction |
|---|---|
| Rechercher produits ou boutiques... | Filtre en direct les résultats selon le nom du produit, le nom de la boutique, la catégorie ou la description. La recherche est temporisée pour éviter des appels inutiles. |
| Curseur de distance | Définit le rayon de recherche entre 1 et 20 km. Le fil est rechargé lorsque la valeur change. |
| Valeur en kilomètres | Affiche la distance actuellement sélectionnée, par exemple `5 km`. |
| Voir la carte | Ouvre la carte afin de visualiser les boutiques correspondantes. |

### Actions sur une carte produit

| Contrôle | Fonction |
|---|---|
| Carte produit | Affiche le détail du produit avec son nom, sa boutique, son prix et son stock lorsqu'un détail local est disponible. |
| Suivre | Ajoute la boutique aux boutiques suivies. Le bouton devient `Suivi(e)`. |
| Suivi(e) | Retire la boutique des boutiques suivies. |
| Réserver | Ouvre le chat avec la boutique et prépare une demande liée au produit. Même lorsqu'un produit est indiqué `Sur demande`, l'utilisateur peut contacter la boutique. |
| Bouton d'itinéraire | Ouvre un itinéraire externe vers les coordonnées de la boutique. |
| Élargir à 10 km | Relance la recherche dans un rayon de 10 km, met à jour le curseur et conserve le texte recherché. Ce bouton apparaît lorsqu'aucun produit n'est trouvé. |

### Indicateurs de carte produit

| Indicateur | Signification |
|---|---|
| Distance | Distance estimée entre l'utilisateur et la boutique. |
| Ouvert | La boutique est ouverte. |
| Fermé | La boutique n'accepte pas actuellement les visites ou actions nécessitant une ouverture. |
| Pause | La boutique est temporairement en pause. |
| En rayon | Le produit possède plus de trois unités indiquées en stock. |
| Dernière pièce | Le stock est faible, avec trois unités ou moins. |
| Sur demande | Le stock indiqué est nul, mais l'utilisateur peut contacter la boutique pour demander des informations ou une disponibilité future. |

## 7. Carte des boutiques

La carte utilise Leaflet et affiche les boutiques situées dans un rayon maximal de 10 km autour de la position courante.

### Contrôles de carte

| Contrôle | Fonction |
|---|---|
| Rechercher une boutique... | Filtre les marqueurs selon le nom, l'adresse, la catégorie ou les produits de la boutique. |
| Plan | Affiche le fond OpenStreetMap. |
| Satellite | Affiche les images satellite. |
| Hybride | Affiche les images satellite avec les limites et noms de lieux. |
| Itinéraire | Ouvre le mode Parcours si au moins une boutique a été ajoutée. Sinon, demande d'ajouter d'abord des boutiques. |
| Localisation | Demande ou actualise la position de l'utilisateur, recentre la carte et recharge les boutiques proches. |
| Marqueur utilisateur | Indique la position actuelle avec le libellé `Vous êtes ici`. |
| Marqueur boutique | Ouvre la fiche de la boutique lorsqu'il est sélectionné. Sa couleur reflète son statut. |
| Marqueur de collection | Ouvre le résumé d'une collection et permet de démarrer son parcours. |

### Fiche d'une boutique sur la carte

| Contrôle | Fonction |
|---|---|
| Suivre / Suivi(e) | Ajoute ou retire la boutique des suivis. |
| Itinéraire | Ouvre Google Maps ou un service d'itinéraire externe vers la boutique. |
| Check-in | Valide la présence de l'utilisateur dans la boutique et ajoute des points si la boutique est ouverte et située à moins de 100 mètres. |
| Ajouter au parcours | Ajoute la boutique à la liste du parcours. |
| Ajouté au parcours | Indique que la boutique est déjà sélectionnée. Le bouton est désactivé. |
| Parcours | Lance le parcours d'une collection affichée sur la carte. |

La fiche affiche aussi l'adresse, le statut et jusqu'à trois produits récents de la boutique.

## 8. Boutiques suivies

Cette page regroupe les boutiques suivies par l'utilisateur.

| Contrôle | Fonction |
|---|---|
| Rechercher une boutique suivie... | Filtre la liste des boutiques suivies par leur nom. |
| Bouton de retrait | Retire immédiatement la boutique de la liste des suivis. |
| Découvrir des boutiques | Ouvre la carte lorsqu'aucune boutique n'est suivie. |
| Défilement de la liste | Charge automatiquement d'autres boutiques lorsque l'utilisateur approche de la fin. |

## 9. Notifications

Le panneau des notifications centralise les événements liés au compte.

| Contrôle | Fonction |
|---|---|
| Notification | Marque l'élément comme lu puis redirige vers l'écran pertinent : fil, chat ou carte selon le type d'événement. |
| Voir plus | Charge la page suivante de notifications. |
| Tout marquer comme lu | Marque toutes les notifications affichées comme lues et remet le badge à zéro. |
| Fermer | Ferme le panneau de notifications. |

Les notifications peuvent signaler un nouveau message, un nouveau produit, une modification de boutique ou un changement de statut.

## 10. Chat et pré-réservation

Le chat permet de contacter une boutique à partir d'un produit.

| Contrôle | Fonction |
|---|---|
| Fermer le chat | Ferme la fenêtre de discussion et réinitialise le produit et la boutique sélectionnés. |
| Champ de message | Permet d'écrire une demande, par exemple l'heure de passage ou une demande de taille. |
| Envoyer | Envoie le message à la boutique avec la référence du produit, son prix et le nom de la boutique. |
| Touche Entrée | Envoie le message depuis le champ de chat. |
| Aperçu de réservation | Rappelle le produit, le prix, l'adresse et les coordonnées de la boutique associés au chat. |

Les retours à la ligne des messages sont conservés dans les bulles de conversation.

## 11. Mode Parcours

Le mode Parcours organise une visite de plusieurs boutiques.

| Contrôle | Fonction |
|---|---|
| Retour | Revient à la carte. |
| À pied | Calcule le parcours selon un déplacement à pied. |
| Voiture | Sélectionne le mode voiture pour le parcours. |
| Choisir des boutiques | Revient à la carte lorsqu'aucune boutique n'a encore été sélectionnée. |
| Bouton de suppression d'une boutique | Retire une étape de la liste du parcours. |
| Calculer l'itinéraire | Trie les boutiques à partir de la position de l'utilisateur et calcule une distance et une durée estimées. |
| Recalculer | Relance le calcul après modification de la liste ou du mode de transport. |
| Démarrer | Ouvre un itinéraire externe avec le départ et les boutiques sélectionnées. |

Le calcul actuel fournit une estimation locale de la distance et du temps. L'ouverture de la navigation finale est faite dans un service externe.

## 12. Profil utilisateur

Le profil affiche l'identité, le rôle, les abonnements, les points et, pour un vendeur, les produits et la boutique associée.

### Actions générales

| Contrôle | Fonction |
|---|---|
| Actualiser | Recharge les données du profil et la liste des produits vendeur. |
| Se déconnecter | Ferme la session côté serveur, efface la session locale et revient à l'authentification. |
| Notifications push | Affiche actuellement l'état de configuration des notifications push. |
| Mode sombre | Affiche actuellement l'état du mode sombre. |
| Mode hors-ligne | Présente l'état du mode hors-ligne et de la mise en cache. |

### Fonctions vendeur

| Contrôle | Fonction |
|---|---|
| Modifier ma boutique | Ouvre la fenêtre de modification du nom, de la catégorie et de la position de la boutique. |
| Ouverte | Définit la boutique comme ouverte. |
| Fermée | Définit la boutique comme fermée. |
| Pause | Définit la boutique comme temporairement en pause. |
| Ajouter un produit | Ouvre le formulaire de publication d'un produit. |
| Créer ma boutique | Ouvre le formulaire de création d'une première boutique pour un vendeur qui n'en possède pas. |
| Modifier un produit | Ouvre l'édition du nom, du prix, de la description et de l'image du produit autorisé. |
| Supprimer un produit | Ouvre une confirmation puis supprime le produit du catalogue du vendeur. |
| Rechercher un produit... | Filtre les produits publiés par le vendeur selon le nom et la description. |

## 13. Création et modification d'une boutique

### Création d'une boutique

| Champ ou contrôle | Fonction |
|---|---|
| Nom de la boutique | Nom public affiché sur la carte et dans les résultats. |
| Catégorie | Classe la boutique : mode, maison, high-tech, alimentation, sport, beauté, livres, jouets ou autres. |
| Carte de position | Permet de placer le centre de la carte sur l'emplacement de la boutique. |
| Contrôles Plan, Satellite, Hybride | Changent le fond de la carte de positionnement. |
| Créer ma boutique | Enregistre la boutique avec ses coordonnées et ouvre ensuite l'espace de publication de produits. |

La géolocalisation est nécessaire pour positionner la boutique. L'adresse est actuellement générée à partir des coordonnées enregistrées.

### Modification d'une boutique

| Champ ou contrôle | Fonction |
|---|---|
| Nom de la boutique | Modifie le nom public de la boutique. |
| Catégorie | Modifie la catégorie de la boutique. |
| Carte de position | Modifie les coordonnées de la boutique. |
| Fermer la fenêtre | Abandonne la modification et ferme la fenêtre. |
| Enregistrer | Envoie les modifications au serveur. |

## 14. Ajout et édition d'un produit

### Ajout d'un produit

| Champ ou contrôle | Fonction |
|---|---|
| Nom du produit | Nom affiché dans le fil, la carte et le catalogue vendeur. |
| Prix | Prix du produit en dollars. Une valeur positive est obligatoire. |
| Ma boutique | Sélectionne la boutique à laquelle le produit est rattaché. |
| Description | Décrit le produit : taille, matière, couleur ou informations utiles. |
| Photo du produit | Zone permettant de sélectionner une image locale. Une prévisualisation est affichée après sélection. |
| Publier le produit | Envoie le produit, son prix, sa description, son stock initial et son image au serveur. |

Les produits nouvellement ajoutés commencent actuellement avec un stock initial de zéro et sont donc présentés comme `Sur demande` jusqu'à leur mise à jour.

### Fenêtre de modification d'un produit

| Champ ou contrôle | Fonction |
|---|---|
| Nom du produit | Modifie le nom du produit. |
| Prix | Modifie le prix du produit. |
| Description | Modifie les informations descriptives. |
| Stock | Permet de modifier la quantité lorsque l'édition complète du stock est disponible dans l'interface. |
| Annuler | Ferme la fenêtre sans enregistrer. |
| Enregistrer | Valide les changements du produit. |
| Fermer | Ferme la fenêtre d'édition. |

<!-- ## 15. Offres flash et disponibilité

Une offre flash met en avant une réduction temporaire avec le pourcentage de remise, la boutique concernée et le temps restant.

| Élément | Fonction |
|---|---|
| Badge de remise | Affiche le pourcentage de réduction, par exemple `-30%`. |
| Temps restant | Indique le temps avant la fin de l'offre. |
| Bouton de localisation | Ouvre un itinéraire vers la boutique proposant l'offre. |
| Badge de disponibilité | Informe rapidement sur le stock : disponible, dernière pièce ou sur demande. | -->

## 16. États et messages de l'application

| État | Signification |
|---|---|
| Chargement | Les données sont en cours de récupération. |
| Aucun résultat | Aucun produit ou boutique ne correspond à la position ou à la recherche. |
| Erreur | Une requête n'a pas pu aboutir. Un message est affiché et l'utilisateur peut réessayer. |
| Session expirée | La session locale est effacée et l'utilisateur est redirigé vers l'authentification. |
| Localisation refusée | L'application utilise un affichage par défaut ou demande à nouveau l'autorisation. |
| Toast de succès | Confirme une action réussie : suivi, envoi, création, mise à jour ou check-in. |
| Toast d'avertissement | Explique une condition non remplie : distance, boutique fermée, champ manquant ou sélection insuffisante. |

## 17. Résumé du parcours utilisateur

1. L'utilisateur ouvre Ag7Spot et se connecte ou crée un compte.
2. Il choisit ses catégories d'intérêt ou passe l'onboarding.
3. Il consulte le fil et ajuste la recherche ou la distance.
4. Il ouvre une fiche produit, suit la boutique, demande un itinéraire ou réserve par message.
5. Il utilise la carte pour comparer les boutiques proches, voir les offres flash et préparer un parcours.
6. Il peut effectuer un check-in sur place pour gagner des points.
7. Il retrouve ses boutiques suivies et ses notifications dans les écrans dédiés.
8. Un vendeur peut créer sa boutique, publier ses produits et maintenir leur disponibilité à jour.

## 18. Note de périmètre

Ce catalogue décrit les contrôles et comportements présents dans la version actuelle du code Ag7Spot. Certains éléments affichés dans les paramètres, comme les notifications push et le mode sombre, sont présentés mais ne disposent pas encore d'un réglage interactif complet.