# Configurer Firebase

Le site est hébergé en fichiers statiques. Quand un client clique sur « Commander sur WhatsApp », WhatsApp s'ouvre immédiatement avec le produit, la quantité et le total ; le site essaie ensuite d'enregistrer la demande dans Firebase. Une erreur Firebase n'empêche donc pas le client d'envoyer sa commande. Aucune coordonnée personnelle n'est enregistrée. Cette demande indique un clic sur le bouton ; le site ne peut pas savoir si le client a ensuite envoyé le message dans WhatsApp.

## 1. Créer le projet Firebase

1. Ouvrez [Firebase Console](https://console.firebase.google.com/) et connectez-vous avec votre compte Google.
2. Cliquez sur **Ajouter un projet**, donnez-lui un nom et terminez la création.
3. Dans les paramètres du projet, ajoutez une **application Web** (icône `</>`). Vous pouvez l'appeler « Douceur Nomade ».
4. Dans la configuration de cette application, copiez les valeurs `apiKey`, `authDomain`, `projectId` et `appId`.
5. Ouvrez `firebase-config.js` et remplacez les valeurs `REMPLACER...` dans `firebaseConfig`.

La configuration Web Firebase n'est pas un mot de passe. Ne mettez jamais de mot de passe ni de clé de compte de service dans les fichiers du site.

## 2. Créer l'accès administrateur

1. Dans Firebase Console, ouvrez **Authentication**, puis **Commencer**.
2. Dans **Sign-in method**, activez **E-mail/Mot de passe**.
3. Dans **Users**, ajoutez votre propre utilisateur avec une adresse e-mail et un mot de passe fort. Ne créez pas de formulaire d'inscription public.
4. Ouvrez la fiche de cet utilisateur et copiez son **UID**.
5. Remplacez `REMPLACER_PAR_UID_ADMIN` dans `firebase-config.js` par cet UID.

## 3. Créer la base et appliquer les règles privées

1. Dans Firebase Console, ouvrez **Firestore Database** et créez une base de données.
2. Ouvrez l'onglet **Règles**.
3. Copiez le contenu de `firestore.rules` dans l'éditeur de règles.
4. Dans ces règles, remplacez `REMPLACER_PAR_UID_ADMIN` par le même UID administrateur.
5. Publiez les règles.

Ces règles autorisent l'enregistrement de demandes limitées aux produits et prix définis, et réservent leur lecture et leur suppression à l'UID administrateur. Ne remplacez pas ces règles par une autorisation générale telle que `allow read, write: if true`.

Si vous ajoutez le produit M15, republiez aussi la version actuelle de `firestore.rules` afin que Firestore accepte les commandes de ce produit.

## 4. Publier et vérifier le site

1. Publiez les fichiers du site sur GitHub Pages.
2. Dans Firebase Console, ouvrez **Authentication > Settings > Authorized domains** et ajoutez le domaine de votre site GitHub Pages (par exemple `votre-compte.github.io`) pour permettre la connexion administrateur.
3. Sur le site publié, choisissez un produit et une quantité, puis vérifiez que le bouton ouvre WhatsApp avec un message court contenant le produit, la quantité et le total.
4. Ouvrez `https://votre-compte.github.io/votre-depot/admin.html` pour consulter les demandes enregistrées et leur nombre.

Le clic sur le bouton ouvre immédiatement WhatsApp dans un nouvel onglet avec un message prérempli adressé au numéro de contact de la boutique, puis le site essaie d'enregistrer la demande dans Firestore. Le client vérifie le produit, la quantité et le total, puis appuie sur **Envoyer**. Le compteur de l'espace administrateur correspond aux demandes enregistrées (clics), pas nécessairement aux messages effectivement envoyés. Aucune coordonnée personnelle n'est demandée ni enregistrée.

L'écran administrateur permet de consulter le nombre de demandes enregistrées et de les supprimer. Une connexion Internet est requise pour enregistrer une demande, ouvrir WhatsApp et consulter ces demandes. Si l'enregistrement échoue, WhatsApp reste ouvert et un message indique que la demande n'a pas été enregistrée ; vérifiez la configuration Firebase, les règles Firestore et la connexion.
