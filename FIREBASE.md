# Configurer Firebase

Le site est hébergé en fichiers statiques. Firebase sert à enregistrer les demandes et à réserver leur consultation à votre compte administrateur. Les clients voient leurs coordonnées pendant qu'ils les saisissent ; les règles Firestore empêchent les visiteurs de lire les commandes enregistrées.

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

Ces règles autorisent l'enregistrement de demandes conformes, mais réservent leur lecture et leur suppression à l'UID administrateur. Ne remplacez pas ces règles par une autorisation générale telle que `allow read, write: if true`.

Si vous ajoutez le produit M15, republiez aussi la version actuelle de `firestore.rules` afin que Firestore accepte les commandes de ce produit.

## 4. Publier et vérifier le site

1. Publiez les fichiers du site sur GitHub Pages.
2. Dans Firebase Console, ouvrez **Authentication > Settings > Authorized domains** et ajoutez le domaine de votre site GitHub Pages (par exemple `votre-compte.github.io`).
3. Ouvrez le site publié, envoyez une demande test avec le formulaire et vérifiez qu'elle apparaît dans Firestore.
4. Ouvrez `https://votre-compte.github.io/votre-depot/admin.html`, connectez-vous avec le compte administrateur créé ci-dessus et vérifiez que la demande apparaît dans votre espace privé.

L'écran des commandes permet de supprimer les demandes lorsqu'elles ne sont plus nécessaires. Une connexion Internet est requise pour envoyer et consulter les commandes. En cas d'erreur, vérifiez la configuration Firebase, les règles Firestore et le domaine autorisé.

## Mettre à jour les compteurs manuels

Les compteurs affichés sous les formulaires ne sont pas calculés automatiquement. Dans `script.js`, modifiez les valeurs `requests` (demandes reçues) et `confirmed` (commandes confirmées), puis republiez le site.
