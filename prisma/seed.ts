/**
 * Script de Seed Prisma pour MLIMA Supplier (Bukavu, RDC)
 * Commande d'exécution : npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Début du peuplement de la base de données MLIMA Supplier ---');

  // 1. Paramètres par défaut du site / CMS
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "MLIMA Supplier",
      tagline: "Votre partenaire d'approvisionnement fiable en RDC",
      heroTitle: "Fournisseur Général d'Équipements & Matériels de Qualité",
      heroSubtitle:
        "Appareils de communication & hospitaliers, pièces de rechange, hygiène, matériel de bureau et services pour ONG, institutions et entreprises à Bukavu et dans toute la RDC.",
      emailPrimary: "mlimasupplier@gmail.com",
      phonePrimary: "+243 993 163 742",
      phoneSecondary: "+243 848 474 077",
      whatsappNumber: "+243993163742",
      rccm: "CD/BKV/RCCM/21-A-00077",
      idNat: "22-G4701-N77955M",
      nif: "A2604579Q",
      bannerNotice: "Devis personnalisé sous 24h à Bukavu et ses environs.",
    },
  });

  // 2. Catégories & Sous-catégories
  const categoriesData = [
    {
      name: "Fourniture d'appareils",
      slug: 'fourniture-appareils',
      description: 'Appareils professionnels de communication, usage hospitalier, laboratoire et électroménager.',
      icon: 'Radio',
      order: 1,
      subcategories: [
        { name: 'Communication', slug: 'communication', description: 'Radios VHF/UHF, Motorola, Kenwood, smartphones et accessoires' },
        { name: 'Usage hospitalier', slug: 'usage-hospitalier', description: 'Équipements médicaux, moniteurs, thermomètres, stérilisateurs' },
        { name: 'Laboratoire', slug: 'laboratoire', description: 'Microscopes, centrifugeuses, pipettes et réactifs' },
        { name: 'Électroménager', slug: 'electromenager', description: 'Réfrigérateurs solaires/combinés, climatiseurs, kits Canal+' },
      ],
    },
    {
      name: 'Pièces de rechange',
      slug: 'pieces-de-rechange',
      description: 'Pièces détachées d’origine et haute résistance pour véhicules, motos, pirogues motorisées et industrie.',
      icon: 'Wrench',
      order: 2,
      subcategories: [
        { name: 'Véhicules', slug: 'vehicules', description: 'Pièces 4x4, Toyota Land Cruiser, filtres, amortisseurs, freins' },
        { name: 'Motos', slug: 'motos', description: 'Kits chaîne, cylindres, leviers, bougies pour motos Boxer, TVS, Yamaha' },
        { name: 'Pirogues motorisées', slug: 'pirogues-motorisees', description: 'Moteurs hors-bord Yamaha/Suzuki, hélices, carburateurs' },
        { name: 'Pneus & Roulements', slug: 'pneus-roulements', description: 'Pneus tout-terrain, roulements industriels NSK/SKF, joints' },
      ],
    },
    {
      name: 'Hygiène et Matériel de bureau',
      slug: 'hygiene-materiel-bureau',
      description: 'Solutions complètes de désinfection, protection individuelle (EPI) et fournitures administratives.',
      icon: 'ShieldCheck',
      order: 3,
      subcategories: [
        { name: 'Produits désinfectants', slug: 'produits-desinfectants', description: 'Aqua-Org désinfectant, chlore, gel hydroalcoolique, savon liquide' },
        { name: 'Matériels de protection', slug: 'materiels-protection', description: 'Combinaisons de protection, gants latex/nitrile, masques de soins' },
        { name: 'Équipement sanitaire', slug: 'equipement-sanitaire', description: 'Poubelles à pédale hospitalières, distributeurs, pulvérisateurs' },
        { name: 'Fournitures de bureau', slug: 'fournitures-bureau', description: 'Rames de papier A4, classeurs, stylos, cartouches, imprimantes' },
      ],
    },
    {
      name: 'Services & Autres',
      slug: 'services-autres',
      description: 'BTP & Construction générale, fourniture de vivres frais et secs, semences certifiées.',
      icon: 'Truck',
      order: 4,
      subcategories: [
        { name: 'Construction', slug: 'construction', description: 'Matériaux BTP, ciment, tôles, fers à béton, outillage' },
        { name: 'Vivres et Semences', slug: 'vivres-semences', description: 'Semences maraîchères certifiées, légumineuses, farine, huiles, vivres' },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, order: cat.order },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
      },
    });

    for (const sub of cat.subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: createdCat.id,
            slug: sub.slug,
          },
        },
        update: { name: sub.name, description: sub.description },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          categoryId: createdCat.id,
        },
      });
    }
  }

  // 3. Exemples de Produits Réels (Inspirés directement des dépliants et catalogues MLIMA)
  const commCat = await prisma.category.findUnique({ where: { slug: 'fourniture-appareils' } });
  const piecesCat = await prisma.category.findUnique({ where: { slug: 'pieces-de-rechange' } });
  const hygieneCat = await prisma.category.findUnique({ where: { slug: 'hygiene-materiel-bureau' } });
  const servicesCat = await prisma.category.findUnique({ where: { slug: 'services-autres' } });

  const sampleProducts = [
    {
      sku: 'ML-RAD-001',
      name: 'Radio Émetteur-Récepteur Professionnel VHF/UHF Kenwood / Motorola',
      slug: 'radio-emetteur-recepteur-kenwood-motorola',
      shortDesc: 'Radio émetteur-récepteur longue portée pour convois humanitaires, sécurité et chantiers.',
      description:
        "Radio communication professionnelle haute robustesse. Batterie longue durée, portée jusqu'à 15km avec antenne optimisée. Idéale pour les ONG, missions de terrain et services de garde.",
      priceUSD: 145.0,
      unit: 'Kit complet',
      stockQuantity: 18,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: commCat!.id,
    },
    {
      sku: 'ML-MED-002',
      name: 'Thermomètre Infrarouge Sans Contact Médical & Professionnel',
      slug: 'thermometre-infrarouge-sans-contact-medical',
      shortDesc: 'Mesure ultra-rapide en 1 seconde avec écran LCD rétroéclairé et alarme sonore.',
      description:
        'Thermomètre frontal infrarouge haute précision certifié CE pour centres de santé, écoles et points de contrôle aux frontières. Mémorisation de 32 mesures.',
      priceUSD: 28.0,
      unit: 'Unité',
      stockQuantity: 45,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: commCat!.id,
    },
    {
      sku: 'ML-SOL-003',
      name: 'Réfrigérateur Électroménager Combiné Solaire 12V/24V Hospitalier',
      slug: 'refrigerateur-combine-solaire-12v-24v',
      shortDesc: 'Conservation des vaccins et produits thermosensibles ou usage domestique haute efficacité.',
      description:
        'Réfrigérateur solaire à basse consommation conçu pour les zones rurales ou sites isolés. Compatible batteries solaires et onduleurs. Volume 180 Litres.',
      priceUSD: 520.0,
      unit: 'Pièce',
      stockQuantity: 6,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: commCat!.id,
    },
    {
      sku: 'ML-PIEC-010',
      name: 'Bougies d’Allumage Haute Performance NGK (Véhicules & Motos)',
      slug: 'bougies-allumage-ngk-vehicules-motos',
      shortDesc: 'Bougies d’allumage d’origine garantissant un démarrage instantané et une économie de carburant.',
      description:
        'Bougies NGK authentiques pour moteurs essence 4 temps et 2 temps. Résistance aux fortes chaleurs et encrassement réduit. Disponibles en boîte de 4 et 10 pièces.',
      priceUSD: 4.5,
      unit: 'Pièce',
      stockQuantity: 250,
      stockStatus: 'IN_STOCK',
      isFeatured: false,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: piecesCat!.id,
    },
    {
      sku: 'ML-PIEC-012',
      name: 'Roulements à Billes Industriels & Mécaniques Haute Précision SKF/NSK',
      slug: 'roulements-a-billes-industriels-skf-nsk',
      shortDesc: 'Gamme complète de roulements étanches pour moyeux, boîtes de transfert et moteurs de pirogues.',
      description:
        'Roulements étanches 2RS lubrifiés à vie. Excellente résistance à l’eau, à la poussière et aux charges lourdes sur les pistes du Kivu.',
      priceUSD: 14.0,
      unit: 'Pièce',
      stockQuantity: 80,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: piecesCat!.id,
    },
    {
      sku: 'ML-PNEU-015',
      name: 'Pneus Tout-Terrain 4x4 Renforcés & Pneus Motos Boxer',
      slug: 'pneus-tout-terrain-4x4-et-motos',
      shortDesc: 'Gomme renforcée pour pistes boueuses et rocailleuses. Structure 8 à 10 plis.',
      description:
        'Pneus tout-terrain robustes adaptés aux véhicules de transport et tout-terrain type Toyota Land Cruiser, Hilux et motos utilitaires.',
      priceUSD: 175.0,
      unit: 'Pneu',
      stockQuantity: 24,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: piecesCat!.id,
    },
    {
      sku: 'ML-HYG-020',
      name: 'Désinfectant Professionnel Haute Action Aqua-Org (Bidon 5 Litres)',
      slug: 'desinfectant-professionnel-aqua-org-5l',
      shortDesc: 'Solution désinfectante concentrée pour hôpitaux, bureaux et locaux communautaires.',
      description:
        'Désinfectant bactéricide, virucide et fongicide de référence. Utilisé dans les structures sanitaires pour la stérilisation des sols et surfaces lavables.',
      priceUSD: 18.5,
      unit: 'Bidon 5L',
      stockQuantity: 95,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: hygieneCat!.id,
    },
    {
      sku: 'ML-EPI-022',
      name: 'Boîte de Gants d’Examen en Latex / Nitrile Non Poudrés (x100)',
      slug: 'gants-examen-latex-nitrile-boite-100',
      shortDesc: 'Protection optimale certifiée pour le personnel de santé et les laboratoires.',
      description:
        'Gants de qualité médicale sans poudre, excellente sensibilité tactile et haute résistance aux déchirures. Tailles disponibles : S, M, L, XL.',
      priceUSD: 9.0,
      unit: 'Boîte de 100',
      stockQuantity: 300,
      stockStatus: 'IN_STOCK',
      isFeatured: false,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: hygieneCat!.id,
    },
    {
      sku: 'ML-SAN-025',
      name: 'Poubelle Sanitaire Médicale à Pédale 30L / 50L (Norme Hygiène)',
      slug: 'poubelle-sanitaire-medicale-a-pedale',
      shortDesc: 'Ouverture sans contact manuel, corps plastique renforcé lavable et résistant aux chocs.',
      description:
        'Poubelles à pédale pour la gestion des déchets hospitaliers et de bureau. Couvercle hermétique limitant les odeurs et la contamination.',
      priceUSD: 24.0,
      unit: 'Pièce',
      stockQuantity: 35,
      stockStatus: 'IN_STOCK',
      isFeatured: false,
      isNew: false,
      images: [
        'https://images.unsplash.com/photo-1610141160723-d4d34650d2b3?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: hygieneCat!.id,
    },
    {
      sku: 'ML-SEM-030',
      name: 'Semences Maraîchères Certifiées & Vivres en Gros',
      slug: 'semences-maraicheres-certifiees-vivres-gros',
      shortDesc: 'Semences à haut rendement pour projets agricoles et approvisionnement en vivres frais/secs.',
      description:
        'Variétés adaptées au climat du Sud-Kivu et de l’Est de la RDC. Taux de germination supérieur à 90%. Conditionnements en sachets hermétiques et sacs.',
      priceUSD: null,
      unit: 'Sur devis / Sac',
      stockQuantity: 50,
      stockStatus: 'IN_STOCK',
      isFeatured: true,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: servicesCat!.id,
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        sku: prod.sku,
        name: prod.name,
        slug: prod.slug,
        shortDesc: prod.shortDesc,
        description: prod.description,
        priceUSD: prod.priceUSD,
        unit: prod.unit,
        stockQuantity: prod.stockQuantity,
        stockStatus: prod.stockStatus as any,
        isFeatured: prod.isFeatured,
        isNew: prod.isNew,
        images: prod.images,
        categoryId: prod.categoryId,
      },
    });
  }

  console.log('✅ Base de données MLIMA Supplier peuplée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
