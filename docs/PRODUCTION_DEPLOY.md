# Mise en production

## Cibles

- Frontend Vite : Vercel, domaine `mlima.supplier.com`, commande `npm run build`, dossier de sortie `dist`.
- API Express : Render, domaine `api.mlima.supplier.com`, blueprint `render.yaml`, vérification de santé `/api/health`.
- La règle Vercel transmet `/api/*` à l’API. `BETTER_AUTH_URL` pointe vers le domaine API pour les callbacks OAuth; `WEB_ORIGIN` et `WEB_ORIGINS` contiennent l’origine frontend autorisée.

## Avant le premier déploiement

1. Vérifier que les domaines appartiennent à MLIMA et configurer leurs DNS sur Vercel et Render.
2. Créer une base Neon dédiée à la production. Ne pas réutiliser la base de développement indiquée dans `docs/LOCAL_TESTING.md`.
3. Renseigner dans Render `DATABASE_URL`, `DIRECT_URL`, les identifiants OAuth Google, `RESEND_API_KEY` et une adresse `MAIL_FROM` vérifiée. Render génère `BETTER_AUTH_SECRET`.
4. Dans Google Cloud, autoriser `https://mlima.supplier.com` et le callback `https://api.mlima.supplier.com/api/auth/callback/google`.
5. Après vérification de la base de production et des migrations, exécuter `npx prisma migrate deploy` avec ses URL de production. Ne pas lancer `db:seed` sur une base de production sans validation du contenu.
6. Déployer l’API Render, puis le frontend Vercel. Vérifier les domaines, l’authentification, le catalogue et le parcours de commande avant d’annoncer le site.

## Contrôle après déploiement

```powershell
$env:API_URL = 'https://api.mlima.supplier.com'
$env:APP_URL = 'https://mlima.supplier.com'
npm run test:local
```

Le smoke test ne crée pas de commande et n’envoie pas de notification réelle.