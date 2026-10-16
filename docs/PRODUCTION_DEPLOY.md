# Mise en production sans domaine personnalisé

Le site utilise les sous-domaines gratuits fournis par les plateformes :

- Frontend Vercel : `https://mlima-supplier.vercel.app`
- API Render : `https://mlima-supplier-api.onrender.com`

Le nom du projet Vercel doit être `mlima-supplier` et celui du service Render `mlima-supplier-api` pour obtenir exactement ces URL. Si une plateforme attribue un autre sous-domaine, remplacez les URL correspondantes dans `vercel.json` et dans `render.yaml`, puis redéployez.

## Vercel

1. Importez le dépôt GitHub `jeanjacquesmusafiri8-sys/Mlima.supplier` et sélectionnez la branche `main`.
2. Choisissez le preset Vite (ou Other si Vite n’est pas détecté) et configurez :
   - Root Directory : `.`
   - Install Command : `npm ci`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Node.js : 22.x
3. Aucun secret ni variable d’environnement n’est requis côté Vercel. `vercel.json` transmet `/api/*` à l’API Render et conserve ainsi les appels navigateur sur la même origine.
4. Après le premier déploiement, vérifiez que le domaine de production Vercel est bien `https://mlima-supplier.vercel.app`.

## Render

1. Créez un Web Service depuis le même dépôt, ou utilisez le Blueprint `render.yaml`.
2. Gardez la branche `main`, la région Frankfurt et le plan `starter` définis dans le Blueprint. La création d’un sous-domaine `onrender.com` ne requiert pas l’achat d’un domaine; le plan d’hébergement Render peut toutefois être payant.
3. Le Blueprint configure le build, la commande de démarrage, le health check, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN` et `WEB_ORIGINS`.
4. Dans l’onglet Environment du service, fournissez les vraies valeurs pour :
   - `DATABASE_URL` : URL Neon avec pooling, pour les requêtes de l’application.
   - `DIRECT_URL` : URL directe Neon, utilisée pour les migrations Prisma.
   - `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` : identifiants OAuth Google.
   - `RESEND_API_KEY` et `MAIL_FROM` : clé Resend et adresse d’envoi dont le domaine est vérifié.
   - `ADMIN_WHATSAPP_NUMBER` : numéro WhatsApp de l’administrateur, au format international.
5. Pour les notifications WhatsApp Cloud automatiques, ajoutez aussi `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ADMIN_NUMBER` et `WHATSAPP_ADMIN_TEMPLATE`. `WHATSAPP_TEMPLATE_LANGUAGE` (défaut `fr`) et `WHATSAPP_GRAPH_API_VERSION` (défaut `v23.0`) sont facultatifs. Sans ces identifiants, le lien WhatsApp reste disponible, mais aucun message Cloud n’est envoyé.

N’ajoutez jamais ces secrets dans Vercel, dans le dépôt ou dans une variable `VITE_*`. Render fournit automatiquement `PORT`; ne définissez pas `API_PORT` en production.

## Base de données et migrations

Utilisez une base Neon dédiée à la production, différente de celle de développement. Vérifiez les deux URL et sauvegardez la base avant toute migration. Après validation de la base cible, lancez `npx prisma migrate deploy` avec les variables de production dans un environnement sécurisé. N’exécutez pas `db:seed` en production sans validation explicite de son contenu.

La migration `20261017000000_remove_delivery_addresses` supprime les colonnes historiques d’adresses et de localisation; les valeurs existantes de ces colonnes seront perdues lorsqu’elle sera appliquée.

## OAuth Google

Dans les identifiants OAuth Google, configurez :

- Origine JavaScript autorisée : `https://mlima-supplier.vercel.app`
- URI de redirection autorisée : `https://mlima-supplier-api.onrender.com/api/auth/callback/google`

Le callback appartient au domaine API Render, car Better Auth y est hébergé. Les URL doivent correspondre exactement aux valeurs publiques des deux plateformes.

## Vérifications après déploiement

Attendez que le health check Render soit sain, puis exécutez depuis PowerShell :

```powershell
$env:API_URL = 'https://mlima-supplier-api.onrender.com'
$env:APP_URL = 'https://mlima-supplier.vercel.app'
npm run test:local
```

Le smoke test vérifie l’API, la connexion à la base, le catalogue, les refus d’accès anonymes et le frontend. Testez ensuite l’inscription/vérification e-mail, Google OAuth, la création d’un devis, sa notification e-mail/WhatsApp et l’accès Super Admin. Render Starter évite la mise en veille des services gratuits, mais a un coût d’hébergement.