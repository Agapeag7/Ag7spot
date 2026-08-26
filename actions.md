# Vue satellite sur la carte

Oui, c’est possible et ça peut aider beaucoup pour les utilisateurs qui ne sont pas habitués à lire une carte classique.

## Mon avis

La meilleure solution n’est pas de remplacer la carte standard par la vue satellite en permanence, mais d’ajouter un bouton de bascule entre :

- Vue standard / plan
- Vue satellite
- Vue hybride (satellite + labels/voies)

Cela donne un équilibre plus naturel :

- les utilisateurs habitués à la carte restent sur le mode standard ;
- les personnes moins à l’aise peuvent basculer vers le satellite pour repérer visuellement les bâtiments, les parkings, les rues et les points d’intérêt.

## Ce que je recommande pour Ag7Spot

1. Garder la carte actuelle par défaut, car elle est claire pour les achats et les itinéraires.
2. Ajouter un bouton visuel dans les contrôles de la carte :
   - "Plan"
   - "Satellite"
   - "Hybride"
3. Conserver les marqueurs de boutiques, les itinéraires et la distance, puisqu’ils restent le vrai repère utile.
4. Rendre le mode satellite accessible en un clic, sans compliquer l’interface.

## Pourquoi cela aide

Pour beaucoup de gens, la carte standard est abstraite. La vue satellite permet de se repérer plus facilement dans le monde réel, surtout si la boutique est dans un quartier, un centre commercial ou un secteur peu connu.

## Implémentation technique possible

On peut faire ça très simplement avec Leaflet en ajoutant plusieurs couches de tuiles :

- OpenStreetMap standard
- Esri World Imagery (satellite)
- CartoDB / OSM hybrid si on veut des labels

La logique est simple :

- 1 couche par défaut : plan
- 1 couche satellite : image réelle
- 1 bouton pour changer de couche

## Conclusion

Oui, c’est une bonne idée, mais il faut la faire avec modération : la vue satellite ne doit pas remplacer la carte standard, elle doit la compléter. C’est le meilleur moyen de répondre aux personnes moins habituées aux cartes, sans casser l’expérience actuelle des utilisateurs plus avancés.
