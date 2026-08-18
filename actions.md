- remplacer la pagination côté client par une pagination côté API


- gestion de la fonction Followers ( pour qu'on soit capable de suivre des boutiques )

- ajout du modale pour modifier un produit ( la modification d'un produit, doit se faire dans l'intervalle de 10 minutes après ajout sinon, le bouton de modification n'apparaît plus ). 

- ajout du modale de confirmation de suppression d'un produit 

- gestion des points pour acheteurs : 

- ajout de la possibilité de changer la position, le nom, catégorie de la boutique 



- stockage des préférences utilisateur, pour actualiser le fil d'actualités ( ajout d'algorithmes des préfèrences ) 
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









<div class="modal-content onboarding-modal">
    <div id="onboardingContainer">
        <div class="onboarding">
            <h2>Bienvenue sur Ag7Spot</h2>
            <p>Choisis les catégories qui t'intéressent :</p>
            <div class="category-grid">
                
                    <div class="category-item" data-category="fashion" onclick="toggleCategory(this)">
                        <i class="fas fa-tshirt"></i>
                        <span>Vêtements</span>
                    </div>
                
                    <div class="category-item" data-category="food" onclick="toggleCategory(this)">
                        <i class="fas fa-utensils"></i>
                        <span>Alimentation</span>
                    </div>
                
                    <div class="category-item" data-category="tech" onclick="toggleCategory(this)">
                        <i class="fas fa-laptop"></i>
                        <span>Électronique</span>
                    </div>
                
                    <div class="category-item" data-category="books" onclick="toggleCategory(this)">
                        <i class="fas fa-book"></i>
                        <span>Livres</span>
                    </div>
                
                    <div class="category-item" data-category="beauty" onclick="toggleCategory(this)">
                        <i class="fas fa-spa"></i>
                        <span>Beauté</span>
                    </div>
                
                    <div class="category-item" data-category="sports" onclick="toggleCategory(this)">
                        <i class="fas fa-running"></i>
                        <span>Sport</span>
                    </div>
                
                    <div class="category-item" data-category="home" onclick="toggleCategory(this)">
                        <i class="fas fa-home"></i>
                        <span>Décoration</span>
                    </div>
                
                    <div class="category-item" data-category="toys" onclick="toggleCategory(this)">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>Jeux</span>
                    </div>
                
            </div>
            <button class="btn-primary" onclick="finishOnboarding()">
                <i class="fas fa-check"></i> Découvrir ma carte
            </button>
            <button class="btn-outline" onclick="skipOnboarding()">
                Passer
            </button>
        </div>
    </div>
</div>