// =========================================
// PAGE : AIDE ET ASSISTANCE
// =========================================
function renderHelp(container) {
    container.innerHTML = `
        <div class="page active help-guide">
            <div class="settings-card help-guide-header">
                <div class="section-title">
                    <span><i class="fas fa-circle-question"></i> Guide d'utilisation</span>
                    <button class="btn-outline btn-sm" type="button" onclick="navigateTo('profile')" aria-label="Retour au profil" title="Retour au profil">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
                <p>Découvre les écrans Ag7Spot dans l'ordre. Chaque section explique quoi faire et ce que signifient les icônes. Touche un titre pour ouvrir ou refermer l'étape.</p>
                <p class="help-guide-entry"><strong>Pour ouvrir ce guide :</strong> Profil <i class="fas fa-arrow-right"></i> Aide et assistance.</p>
            </div>

            <div class="settings-card help-guide-content">
                <details class="help-topic" open>
                    <summary><span class="help-step-number">1</span><i class="fas fa-user-plus"></i> Créer un compte ou se connecter</summary>
                    <ol>
                        <li>Sur l'écran de bienvenue, choisis <i class="fas fa-sign-in-alt"></i> <strong>Connexion</strong> si tu as déjà un compte, ou <i class="fas fa-user-plus"></i> <strong>Créer un compte</strong> pour t'inscrire.</li>
                        <li>Saisis ton nom d'utilisateur et ton mot de passe. À l'inscription, choisis <strong>Acheteur</strong> ou <strong>Vendeur</strong>, confirme le mot de passe et accepte la politique de confidentialité et les conditions.</li>
                        <li>Un mot de passe d'inscription doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial. Le nom d'utilisateur doit respecter les règles affichées sous le champ.</li>
                        <li><strong>Se souvenir de moi</strong> conserve la session selon le fonctionnement de la connexion. Après l'inscription, tu peux choisir les catégories qui t'intéressent, puis toucher <strong>Découvrir ma carte</strong>. <strong>Passer</strong> ouvre directement le fil.</li>
                    </ol>
                    <p><i class="fas fa-shirt"></i> Vêtements, <i class="fas fa-utensils"></i> alimentation, <i class="fas fa-laptop"></i> électronique, <i class="fas fa-book"></i> livres, <i class="fas fa-spa"></i> beauté, <i class="fas fa-person-running"></i> sport, <i class="fas fa-house"></i> décoration et <i class="fas fa-puzzle-piece"></i> jeux sont les catégories de l'accueil. Touche une tuile pour la sélectionner ou la désélectionner.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">2</span><i class="fas fa-compass"></i> Comprendre la navigation et les icônes fixes</summary>
                    <ul class="help-icon-list">
                        <li><i class="fas fa-search"></i><span><strong>Loupe, en-tête :</strong> ouvre ou ferme la recherche du fil. Si tu es sur un autre écran, elle revient d'abord au fil. <kbd>Échap</kbd> ferme la recherche et efface le filtre.</span></li>
                        <li><i class="fas fa-bell"></i><span><strong>Cloche :</strong> ouvre les notifications. Le nombre sur le badge indique celles qui ne sont pas lues; le badge seul n'est pas un bouton séparé.</span></li>
                        <li><i class="fas fa-newspaper"></i><span><strong>Fil :</strong> produits proposés autour de toi.</span></li>
                        <li><i class="fas fa-map"></i><span><strong>Carte :</strong> boutiques proches et leurs fiches.</span></li>
                        <li><i class="fas fa-plus"></i><span><strong>Plus :</strong> espace vendeur pour créer une boutique ou ajouter un produit. Pour un compte acheteur, l'écran indique que l'accès est réservé aux vendeurs.</span></li>
                        <li><i class="fas fa-heart"></i><span><strong>Suivis :</strong> liste des boutiques que tu suis.</span></li>
                        <li><i class="fas fa-user"></i><span><strong>Profil :</strong> statistiques, boutique vendeur, paramètres et accès à cette aide.</span></li>
                    </ul>
                    <p>La barre de navigation apparaît après connexion. Le logo Ag7Spot en haut identifie l'application et ne sert pas de bouton.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">3</span><i class="fas fa-newspaper"></i> Trouver un produit dans le fil</summary>
                    <ol>
                        <li>Ouvre <strong>Fil</strong>. La liste présente les produits disponibles selon les résultats à proximité.</li>
                        <li>Pour chercher, touche la <i class="fas fa-search"></i> loupe en haut, puis saisis un nom de produit, de boutique, une catégorie ou un mot de la description.</li>
                        <li>Déplace le curseur <i class="fas fa-location-dot"></i> pour régler le rayon de 1 à 20 km. Le nombre affiché indique le rayon choisi. Autorise la localisation pour obtenir des résultats adaptés à ta position; sans autorisation, l'application peut utiliser une position par défaut.</li>
                        <li>Si aucun produit ne correspond, utilise <strong>Élargir à 10 km</strong> lorsqu'il est proposé, ou augmente toi-même le rayon.</li>
                        <li>Touche une carte produit pour afficher un résumé système avec le nom, la boutique, le prix et le stock. Le bouton <strong>Réserver</strong> ouvre le chat avec la boutique. Le bouton avec le logo Ag7Spot ouvre un itinéraire externe dans Google Maps.</li>
                    </ol>
                    <p>Fais défiler vers le bas pour charger automatiquement la suite des produits. <i class="fas fa-check-double"></i> indique que tu as atteint la fin de la liste.</p>
                    <ul class="help-icon-list">
                        <li><i class="fas fa-store"></i><span><strong>Boutique :</strong> nom du vendeur associé au produit.</span></li>
                        <li><i class="fas fa-location-dot"></i><span><strong>Distance :</strong> estimation entre ta position et la boutique.</span></li>
                        <li><i class="fas fa-heart"></i><span><strong>Suivre / Suivi(e) :</strong> ajoute ou retire la boutique des suivis. Le cœur concerne la boutique, pas un panier d'achat.</span></li>
                        <li><i class="fas fa-comment"></i><span><strong>Bulle de dialogue / Réserver :</strong> démarre une demande par message; ce n'est pas un paiement.</span></li>
                        <li><i class="fas fa-triangle-exclamation"></i><span><strong>Dernière pièce :</strong> le stock déclaré est de 1 à 3 unités.</span></li>
                        <li><i class="fas fa-circle-check"></i><span><strong>En rayon :</strong> le stock déclaré dépasse 3 unités; le nombre est affiché.</span></li>
                        <li><i class="fas fa-hand"></i><span><strong>Sur demande :</strong> le stock déclaré est nul. Contacte le vendeur pour demander une disponibilité.</span></li>
                    </ul>
                    <p>Le statut de boutique précise si elle est <strong>Ouverte</strong>, <strong>Fermée</strong> ou <strong>en Pause</strong>. Il ne garantit pas qu'un produit sera encore disponible au moment de ta visite.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">4</span><i class="fas fa-map"></i> Explorer la carte et une boutique</summary>
                    <ol>
                        <li>Ouvre <strong>Carte</strong> et autorise la localisation si ton appareil le demande. La carte affiche les boutiques proches, dans un rayon d'environ 10 km.</li>
                        <li>Utilise <strong>Plan</strong>, <strong>Satellite</strong> ou <strong>Hybride</strong> pour changer le fond de carte.</li>
                        <li>Le champ <strong>Rechercher une boutique...</strong> filtre par nom, adresse, catégorie ou produit. Le badge sur l'onglet Carte indique le nombre de boutiques proches.</li>
                        <li>Touche le marqueur d'une boutique pour consulter son adresse, son statut, quelques produits et les offres flash éventuelles.</li>
                        <li>Dans la fiche, <strong>Suivre</strong> ajoute la boutique à tes suivis; <i class="fas fa-route"></i> <strong>Itinéraire</strong> ouvre Google Maps; <strong>Ajouter au parcours</strong> la garde dans la liste du parcours.</li>
                    </ol>
                    <ul class="help-icon-list">
                        <li><i class="fas fa-location-arrow"></i><span><strong>Flèche de localisation :</strong> actualise ta position, recentre la carte et recharge les boutiques.</span></li>
                        <li><i class="fas fa-circle"></i><span><strong>Point coloré avec « Vous êtes ici » :</strong> ta position courante sur la carte.</span></li>
                        <li><i class="fas fa-store"></i><span><strong>Marqueur boutique :</strong> sa couleur reprend le statut affiché (vert ouvert, jaune/orange en pause, rouge fermé).</span></li>
                        <li><i class="fas fa-bolt"></i><span><strong>Éclair :</strong> indique une offre flash lorsqu'une offre est disponible pour cette boutique.</span></li>
                        <li><i class="fas fa-map-pin"></i><span><strong>Épingle d'une offre :</strong> ouvre un itinéraire externe vers la boutique qui propose l'offre.</span></li>
                        <li><i class="fas fa-flag"></i><span><strong>Drapeau :</strong> collection de boutiques. Ouvre-la puis touche <strong>Parcours</strong> pour lancer le parcours associé, si au moins deux boutiques sont disponibles.</span></li>
                        <li><i class="fas fa-circle-info"></i><span><strong>Information :</strong> accompagne le rappel sur la proximité des boutiques affichées.</span></li>
                    </ul>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">5</span><i class="fas fa-route"></i> Préparer un parcours de visite</summary>
                    <ol>
                        <li>Sur la carte, ouvre la fiche de chaque boutique souhaitée et touche <strong>Ajouter au parcours</strong>. La fiche affiche <strong>Ajouté au parcours</strong> si elle est déjà sélectionnée.</li>
                        <li>Quand au moins une boutique est ajoutée, touche le bouton <i class="fas fa-route"></i> en haut de la carte pour ouvrir le mode Parcours. Pour calculer un itinéraire, il faut au moins deux boutiques.</li>
                        <li>Choisis <i class="fas fa-person-walking"></i> <strong>À pied</strong> ou <i class="fas fa-car"></i> <strong>Voiture</strong>. Retire une étape avec le bouton <i class="fas fa-xmark"></i>.</li>
                        <li>Touche <strong>Calculer l'itinéraire</strong>. L'application ordonne les étapes à partir de ta position et affiche une estimation de distance et de durée.</li>
                        <li>Touche <i class="fas fa-play"></i> <strong>Démarrer</strong> pour ouvrir Google Maps avec les points sélectionnés.</li>
                    </ol>
                    <p><i class="fas fa-rotate"></i> Recalculer met à jour l'estimation. Elle est simplifiée et ne remplace pas les conditions réelles de circulation ou de marche; vérifie le trajet dans l'application de navigation externe.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">6</span><i class="fas fa-comment"></i> Envoyer une demande ou réserver par message</summary>
                    <ol>
                        <li>Depuis un produit, touche <strong>Réserver</strong>. Le chat rappelle le nom du produit, le prix et les coordonnées de la boutique.</li>
                        <li>Écris ta question ou ta demande dans le champ, par exemple une taille souhaitée ou une heure de passage.</li>
                        <li>Touche <i class="fas fa-paper-plane"></i> Envoyer, ou appuie sur <kbd>Entrée</kbd>. La demande est envoyée à la boutique avec la référence du produit.</li>
                        <li>La croix <i class="fas fa-xmark"></i> ferme le chat. Les messages disponibles sont chargés dans la conversation.</li>
                    </ol>
                    <p>Un message ne confirme pas à lui seul une réservation, un paiement ou la disponibilité. Attends la réponse du vendeur et convenez directement des détails. Ne transmets pas de mot de passe ni d'information sensible dans le chat.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">7</span><i class="fas fa-heart"></i> Gérer les boutiques suivies et les notifications</summary>
                    <ol>
                        <li>Ouvre <strong>Suivis</strong> pour retrouver les boutiques suivies. Utilise le champ de recherche pour filtrer par nom.</li>
                        <li>Le bouton <i class="fas fa-xmark"></i> retire une boutique de la liste. Tu peux aussi la retirer avec le bouton <strong>Suivi(e)</strong> sur le fil ou la carte.</li>
                        <li>Fais défiler la liste vers le bas pour charger les boutiques suivies suivantes. <i class="fas fa-heart-crack"></i> signale qu'aucune boutique n'est suivie; le bouton proposé ouvre la carte pour en découvrir.</li>
                        <li>Touche la <i class="fas fa-bell"></i> cloche pour ouvrir les notifications. Sélectionner une notification la marque comme lue et peut t'envoyer vers le fil, une conversation ou la carte.</li>
                        <li><i class="fas fa-chevron-down"></i> <strong>Voir plus</strong> charge d'autres notifications. <i class="fas fa-check-double"></i> <strong>Tout marquer comme lu</strong> remet le badge à zéro. <i class="fas fa-xmark"></i> ferme le panneau.</li>
                    </ol>
                    <p>Les icônes de notification distinguent notamment un message (<i class="fas fa-comment"></i>), un nouveau produit (<i class="fas fa-box-open"></i>) et une mise à jour de boutique (<i class="fas fa-store"></i>). Un point signale une notification non lue.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">8</span><i class="fas fa-user"></i> Utiliser ton profil et les réglages</summary>
                    <ul>
                        <li>L'avatar identifie le compte; le rôle indique <strong>Acheteur</strong> ou <strong>Vendeur</strong>. Les statistiques affichent les abonnements et les points; les vendeurs voient aussi le nombre de produits.</li>
                        <li><i class="fas fa-bell"></i> <strong>Notifications push :</strong> touche le bouton d'état pour demander l'autorisation du navigateur ou de l'appareil. Si tu as refusé, réactive-la dans les réglages du navigateur. Il faut un navigateur compatible et une connexion sécurisée pour les notifications push.</li>
                        <li><i class="fas fa-circle-question"></i> <strong>Aide et assistance :</strong> ouvre ce guide. La flèche <i class="fas fa-arrow-left"></i> en haut ramène au profil.</li>
                        <li><i class="fas fa-right-from-bracket"></i> <strong>Se déconnecter :</strong> ferme ta session sur cet appareil.</li>
                    </ul>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">9</span><i class="fas fa-store"></i> Vendre : créer et gérer une boutique</summary>
                    <ol>
                        <li>Crée un compte de type <strong>Vendeur</strong>. Depuis le profil, touche <strong>Créer ma boutique</strong> ou le <i class="fas fa-plus"></i> bouton central.</li>
                        <li>Saisis le nom et la catégorie. Sur la carte, déplace le repère pour choisir l'emplacement, puis touche <strong>Créer ma boutique</strong>. La localisation doit être autorisée.</li>
                        <li>Une fois la boutique créée, touche <strong>Ajouter un produit</strong> ou le bouton central <i class="fas fa-plus"></i>.</li>
                        <li>Renseigne le nom, le prix, la boutique et, si utile, une description. Décoche <strong>Afficher le prix aux clients</strong> si tu veux afficher « Prix sur demande ».</li>
                        <li>Touche la zone <i class="fas fa-cloud-arrow-up"></i> de photo pour choisir une image, puis <strong>Publier le produit</strong>. Une image de remplacement est utilisée si tu n'en sélectionnes pas.</li>
                        <li>Dans le profil, cherche parmi tes produits. <i class="fas fa-pen-to-square"></i> ou <i class="fas fa-edit"></i> Modifier te permet actuellement de changer le nom et le prix; <i class="fas fa-trash"></i> Supprimer demande une confirmation. La liste charge d'autres produits quand tu la fais défiler.</li>
                        <li>Pour modifier la boutique, touche <i class="fas fa-pen-to-square"></i> <strong>Modifier ma boutique</strong>, ajuste son nom, sa catégorie ou sa position, puis <i class="fas fa-save"></i> enregistre.</li>
                        <li>Les boutons <i class="fas fa-door-open"></i> <strong>Ouverte</strong>, <i class="fas fa-door-closed"></i> <strong>Fermée</strong> et <i class="fas fa-mug-hot"></i> <strong>Pause</strong> changent le statut visible de la boutique.</li>
                    </ol>
                    <p><strong>Stock :</strong> les nouveaux produits sont actuellement publiés avec un stock initial de zéro et apparaissent « Sur demande ». Les options d'édition visibles dans le profil ne proposent pas de réglage de stock.</p>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">10</span><i class="fas fa-triangle-exclamation"></i> Icônes et fonctions à connaître</summary>
                    <ul>
                        <li><i class="fas fa-shopping-bag"></i> <strong>Sac de courses :</strong> titre de l'écran de création de boutique ou d'ajout de produit; il ne représente pas un panier d'achat.</li>
                        <li><i class="fas fa-lock"></i> <strong>Cadenas :</strong> l'espace d'ajout est réservé aux comptes vendeur.</li>
                        <li><i class="fas fa-map-marker-alt"></i> <strong>Repère fixe sur la carte :</strong> centre choisi pour placer ou déplacer l'adresse de ta boutique.</li>
                        <li><i class="fas fa-reply"></i> <strong>Flèche de réponse :</strong> rappel du produit et du prix associés au chat de réservation.</li>
                        <li><i class="fas fa-check"></i> <strong>Coche :</strong> confirme la sélection d'une catégorie ou indique qu'une boutique est déjà dans le parcours.</li>
                        <li><i class="fas fa-list-ul"></i> <strong>Liste numérotée :</strong> ordre des étapes calculé pour le parcours; les flèches montrent leur succession.</li>
                        <li><i class="fas fa-box"></i> et <i class="fas fa-box-open"></i> <strong>Boîtes :</strong> produits dans la liste vendeur et notifications de nouveaux produits.</li>
                        <li><i class="fas fa-cloud-upload-alt"></i> <strong>Nuage avec flèche :</strong> zone de sélection de la photo d'un produit.</li>
                        <li><i class="fas fa-plus-circle"></i> <strong>Plus dans un cercle :</strong> publier un produit ou démarrer sa création.</li>
                        <li><i class="fas fa-times"></i> <strong>Croix :</strong> fermer une fenêtre ou retirer une étape/boutique selon l'écran. <i class="fas fa-trash"></i> supprime un produit après confirmation.</li>
                        <li><i class="fas fa-save"></i> <strong>Disquette :</strong> enregistrer les modifications de la boutique.</li>
                        <li><i class="fas fa-spinner fa-spin"></i> <strong>Icône tournante :</strong> chargement en cours; attends la fin avant de recommencer une action.</li>
                        <li><i class="fas fa-store-slash"></i> <strong>Boutique barrée :</strong> aucun produit ne correspond au rayon ou à la recherche.</li>
                        <li><i class="fas fa-heart-broken"></i> <strong>Cœur brisé :</strong> aucune boutique suivie pour le moment.</li>
                        <li><i class="fas fa-exclamation-circle"></i> <strong>Point d'exclamation :</strong> une page n'a pas réussi à charger; vérifie le réseau et réessaie.</li>
                        <li><i class="fas fa-gear"></i> <strong>Engrenage / Paramètres :</strong> titre de la zone de réglages du profil.</li>
                        <li><i class="fas fa-moon"></i> <strong>Mode sombre :</strong> le profil affiche actuellement « Désactivé », sans commande permettant de l'activer.</li>
                        <li><i class="fas fa-wifi"></i> <strong>Mode hors-ligne :</strong> le profil affiche cette ligne, mais aucun interrupteur ni téléchargement de carte n'est proposé ici. Certaines données peuvent ne pas être disponibles sans réseau.</li>
                        <li><strong>Points :</strong> compteur affiché sur le profil. Le bouton check-in est masqué dans la fiche de carte actuelle; aucun parcours utilisateur ne permet donc de gagner des points depuis cet écran.</li>
                        <li><i class="fas fa-user-pen"></i> <strong>Modification du profil :</strong> aucune commande n'est actuellement affichée pour modifier l'avatar ou le nom depuis le profil.</li>
                        <li><i class="fas fa-flag"></i> <strong>Collections :</strong> une collection peut apparaître sur la carte sous forme de drapeau si des données sont disponibles. L'écran de création/liste des collections n'est pas accessible depuis la navigation actuelle.</li>
                    </ul>
                </details>

                <details class="help-topic">
                    <summary><span class="help-step-number">11</span><i class="fas fa-life-ring"></i> Résoudre un problème rapidement</summary>
                    <ul>
                        <li><strong>La carte est vide :</strong> autorise la localisation, touche <i class="fas fa-location-arrow"></i> pour actualiser ta position, puis vérifie la recherche.</li>
                        <li><strong>Aucun produit :</strong> efface la recherche ou augmente le rayon; les résultats dépendent des boutiques et produits disponibles autour de toi.</li>
                        <li><strong>Les notifications push restent inactives :</strong> vérifie l'autorisation du navigateur, la connexion et l'accès sécurisé à l'application.</li>
                        <li><strong>Une action échoue :</strong> vérifie le réseau et réessaie. Les messages de confirmation ou d'erreur apparaissent en bas de l'écran.</li>
                    </ul>
                </details>

                <div class="help-legal-links">
                    <span>Documents du compte</span>
                    <button class="btn-outline" type="button" onclick="navigateTo('privacy')"><i class="fas fa-shield-halved"></i> Confidentialité</button>
                    <button class="btn-outline" type="button" onclick="navigateTo('terms')"><i class="fas fa-file-contract"></i> Conditions d'utilisation</button>
                </div>
            </div>
        </div>
    `;
}