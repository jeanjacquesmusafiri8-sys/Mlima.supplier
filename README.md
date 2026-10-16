# Mlima.supplier

Catalogue B2B et demandes de devis pour MLIMA Supplier.

## Prérequis

- Node.js et npm
- PostgreSQL accessible via `DATABASE_URL` et `DIRECT_URL`
- Variables d’environnement configurées à partir de `.env.example`

## Développement local

```powershell
npm install
npm run db:generate
npm run dev:api
npm run dev
```

Vite sert l’interface sur `http://localhost:3004`; l’API Express utilise `http://localhost:3001`.
Consulter [les consignes de test local](docs/LOCAL_TESTING.md) pour les variables d’authentification et les vérifications disponibles.

## Vérifications

```powershell
npm run lint
npm run build
npm run db:validate
npm run test:local
```

## Déploiement

Voir [le guide de mise en production](docs/PRODUCTION_DEPLOY.md). Les migrations de base se déploient explicitement avec `npx prisma migrate deploy` après validation de l’environnement cible.
