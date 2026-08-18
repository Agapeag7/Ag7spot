- Menu "Carte" dynamisé le compteur de nombre des boutiques de la section "Carte" sur le rayon de 10km de la position de l'utilisateur :
<span class="badge" id="dealBadge">3</span>

- gestion de la fonction Followers ( pour qu'on soit capable de suivre des boutiques )

- création de regex de recherche des Boutiques et Marchandises sur le fil d'actualités et sur la carte

- gestion du fil d'actualités ( chargée les informations par lot ( 5 publications ) au fur et à mesure que l'utilisateur scrolle ) selon les préférences de l'utilisateur 

- gestion de chargement des produits sur le profil vendeur ( charger les produits sur le profil par lot ( de 5 produits ), au fur et à mesure que l'utilisateur scrolle les produits )

- les produits sur le profil vendeur ne doivent pas déborder du conteneur, donc on ajoute un scrolle 

- ajout du modale pour modifier un produit ( la modification d'un produit, doit se faire dans l'intervalle de 10 minutes après ajout sinon, le bouton de modification n'apparaît plus ). 

- ajout du modale de confirmation de suppression d'un produit 

- gestion des points pour acheteurs : 

- stockage des préférences utilisateur, pour actualiser le fil d'actualités ( ajout d'algorithmes des préfèrences ) 

- ajout de la possibilité de changer la position, le nom, catégorie de la boutique 


ALGORITHME DE RECOMMANDATION :
# Fonctionnement

## Collecte de données : 
L'algorithme enregistre vos actions (clics, abonnements, temps d'arrêt sur une publication).

## Calcul de score : 
Chaque contenu reçoit une note de pertinence basée sur la probabilité que vous réagissiez.

## Personnalisation : 
Le fil d'actualité s'adapte en continu pour vous proposer des thèmes similaires, créant parfois une bulle informationnelle.



# Critères principaux utilisés

## L'engagement : 
Les publications qui génèrent beaucoup de réactions montent plus vite.

## La récence : 
Les contenus récents sont favorisés pour garder le fil vivant.

## La relation : 
Les interactions régulières avec certaines boutiques renforcent leur visibilité.