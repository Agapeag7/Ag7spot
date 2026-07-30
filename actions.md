## Suggestions fonctionnelles

### 1. Clarifier la recherche sur la carte
- Si tu affiches un champ `Rechercher une boutique`, il faut que la recherche filtre vraiment les boutiques visibles.
- Sinon, c’est mieux de l’enlever ou de la transformer en “Recherche à venir”.

### 2. Rendre le mode parcours cohérent
- Le parcours doit être accessible soit depuis la carte, soit depuis les collections.
- Ne dis pas “Sélectionne des boutiques sur la carte” si le bouton d’ajout n’existe pas.
- L’utilisateur doit comprendre qu’il peut ajouter des magasins à un itinéraire, pas juste lancer un parcours vide.

### 3. Simplifier la navigation entre pages
- Éviter le détour `map -> feed -> parcours`.
- Si l’utilisateur veut un itinéraire, il doit aller directement sur une page parcours ou un écran dédié.
- Le flux doit être : sélection de boutiques → calcul du parcours → affichage des résultats.

### 4. Ajuster le check-in
- Le check-in doit être lié à une proximité réelle et à un statut cohérent.
- Si l’utilisateur est trop loin, afficher un message clair et ne pas dire “validé”.
- Si la géoloc est hors service, indiquer que le check-in est impossible sans position.

### 5. Faire correspondre les éléments affichés et le sens métier
- Les marqueurs “flash deals” doivent représenter des offres, pas juste des points aléatoires.
- Une collection ne doit pas seulement afficher un drapeau ; elle doit proposer un itinéraire clair vers plusieurs boutiques.
- La météo “boutique ouverte / fermée” doit être logique partout : sur la carte, dans les popups et dans les actions possibles.

---

## Constats utiles

- Tu as un bon concept “carte + boutique + parcours”, mais le message utilisateur n’est pas toujours aligné avec les actions.
- Il vaut mieux prioriser l’expérience :
  - recherche fonctionnelle,
  - parcours bien déclenché,
  - check-in fiable.

Si tu veux, je peux te proposer un texte simple pour décrire chaque fonctionnalité à un designer / product manager.