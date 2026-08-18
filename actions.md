- sur profil vendeur ajout de gestion d'ouverture et fermeture de boutique car sur la carte les boutiques ouverts s'affiche en couleur verte et les boutiques fermer s'affiche en couleur rouge

- gestion de la fonction Followers ( pour qu'on soit capable de suivre des boutiques )

- création et mis à place de regex ou algorithme de recherche des Boutiques et Marchandises sur le fil d'actualités et sur la carte

- gestion du fil d'actualités ( chargée les informations par lot ( 5 publications ainsi de suite ) au fur et à mesure que l'utilisateur scrolle ) selon les préférences de l'utilisateur :
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