# Tests locaux MLIMA Supplier

## 1. Variables et origines

Copier `.env.example` vers `.env` et fournir les valeurs réelles localement. Ne jamais committer `.env`.

Pour le développement par défaut :

- Frontend : `http://localhost:3004`
- API et Better Auth : `http://localhost:3001`
- `BETTER_AUTH_URL=http://localhost:3001`
- `WEB_ORIGIN=http://localhost:3004`

Vite utilise le port fixe `3004`. Better Auth et CORS acceptent les ports de développement `localhost:3000` à `localhost:3010`, mais cette plage n’est jamais autorisée en production.

Dans Google Cloud Console, pour le client OAuth utilisé en local, ajouter :

- Origine JavaScript autorisée : `http://localhost:3004`
- URI de redirection autorisée : `http://localhost:3001/api/auth/callback/google`

Better Auth autorise explicitement la liaison des comptes Google avec un compte existant de même adresse, même si l’ancien compte local n’a pas terminé sa vérification Resend. Le compte Google doit fournir `email_verified=true` ; les adresses différentes ne sont jamais liées. Si `account_not_linked` persiste, vérifier la vérification Google, le compte utilisé et l’URI de redirection. Ne pas supprimer les tables `user`/`account` pour contourner l’erreur : cela efface les comptes et sessions existants.

Pour la production, enregistrer l’origine HTTPS du frontend et l’URI `https://API_DOMAIN/api/auth/callback/google`, puis configurer `BETTER_AUTH_URL`, `WEB_ORIGIN` et `WEB_ORIGINS` avec ces URL HTTPS exactes.

## 2. Resend et WhatsApp

`RESEND_API_KEY` doit être une clé Resend valide commençant par `re_`. `MAIL_FROM` doit être une adresse expéditrice dont le domaine est vérifié dans Resend. Les variables présentes mais de forme invalide ou contenant un placeholder ne sont pas considérées comme configurées. Les e-mails de commande sont destinés à `mlimasupplier@gmail.com`.

Le lien WhatsApp utilise `ADMIN_WHATSAPP_NUMBER`; en local, le numéro MLIMA par défaut est utilisé si cette variable manque. Cela ouvre WhatsApp dans le navigateur, ce n’est pas un envoi Cloud API en arrière-plan. Pour l’envoi automatique, configurer également `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ADMIN_TEMPLATE` et la langue du modèle approuvé.

## 3. Démarrer et vérifier

Dans deux terminaux :

```powershell
npm run dev:api
npm run dev
```

La base Neon configurée est la base de développement partagée ; `npm run db:seed` insère/met à jour les données de démonstration. Ne lancer ce seed que sur une base de développement.

Lancer les vérifications sans créer de commande ni envoyer de notification :

```powershell
$env:APP_URL = 'http://localhost:3004'
npm run test:local
npm run lint
npm run build
npm run db:validate
```

Le smoke test valide l’état DB, le catalogue et les refus `401` des routes panier/commandes/admin sans session. Il ne teste pas l’envoi d’un vrai e-mail.

## 4. Parcours manuel

1. Inscrire un compte client. Vérifier l’e-mail avec Resend, puis se connecter.
2. Confirmer que le compte voit le catalogue et que `/api/orders` et `/api/cart` refusent les appels anonymes.
3. Ajouter un produit, changer sa quantité, recharger la page puis vérifier la persistance du panier.
4. Soumettre une demande de devis de test. Vérifier son statut `PENDING`, les articles et quantités, l’e-mail à l’administrateur et l’ouverture du lien WhatsApp.
5. Depuis le menu d’authentification, lancer Google OAuth et confirmer que le retour arrive sur l’origine frontend locale.
6. Se connecter avec `mlimasupplier@gmail.com` pour contrôler le rôle Super Admin et l’accès à `/api/admin/orders`.

Le rôle Super Admin est attribué à l’inscription à partir de l’e-mail officiel, pas d’un rôle fourni par le navigateur. Ne pas stocker un mot de passe admin en clair dans le code ou le dépôt ; définir/réinitialiser ce mot de passe depuis le flux d’authentification après validation de Resend.
