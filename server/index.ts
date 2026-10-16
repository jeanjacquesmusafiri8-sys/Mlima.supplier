import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { auth, googleAuthEnabled, googleRedirectUri } from './auth';
import { isEmailConfigured, sendEmail, sendOrderNotificationEmail } from './email';
import { prisma } from './prisma';
import { buildOrderWhatsAppUrl, isWhatsAppConfigured, isWhatsAppLinkConfigured, sendWhatsAppQuoteNotification } from './whatsapp';

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const allowedOrigins = new Set(
  [
    process.env.WEB_ORIGIN,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VITE_APP_URL,
    ...(process.env.WEB_ORIGINS || '').split(','),
  ].flatMap((value) => {
    if (!value?.trim()) return [];
    try {
      return [new URL(value.trim()).origin];
    } catch {
      console.warn('Ignoring an invalid CORS origin configuration.');
      return [];
    }
  }),
);
if (process.env.NODE_ENV !== 'production') {
  for (const host of ['localhost', '127.0.0.1']) {
    for (let port = 3000; port <= 3010; port += 1) allowedOrigins.add(`http://${host}:${port}`);
    allowedOrigins.add(`http://${host}:5173`);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS.'));
  },
  credentials: true,
}));
app.all('/api/auth/*', toNodeHandler(auth));
app.use(express.json({ limit: '1mb' }));

async function getVerifiedUser(request: express.Request) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session?.user || !session.user.emailVerified) return null;
  return session.user as typeof session.user & {
    role?: string;
    phone?: string | null;
    companyName?: string | null;
  };
}

function isAdminUser(user: { role?: string; email: string }) {
  return user.role === 'ADMIN' && user.email.trim().toLowerCase() === 'mlimasupplier@gmail.com';
}

async function notifyRegisteredUsers(title: string, message: string) {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return;
    await prisma.userNotification.createMany({
      data: users.map((user) => ({ userId: user.id, title, message })),
    });
  } catch (error) {
    console.error("Failed to create product notifications:", error);
  }
}

async function requireAdmin(
  request: express.Request,
  response: express.Response,
) {
  const user = await getVerifiedUser(request);
  if (!user) {
    response.status(401).json({ error: "Authentification requise." });
    return false;
  }
  if (!isAdminUser(user)) {
    response.status(403).json({ error: "Accès administrateur refusé." });
    return false;
  }
  return true;
}

const adminProductSchema = z
  .object({
    sku: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(220),
    shortDesc: z.string().trim().max(500).optional().default(""),
    description: z.string().trim().max(10000).optional().default(""),
    specifications: z.record(z.string(), z.string()).optional(),
    priceUSD: z.number().nonnegative().nullable().optional(),
    isQuoteOnly: z.boolean().optional().default(false),
    unit: z.string().trim().min(1).max(40).optional().default("Pièce"),
    minOrderQuantity: z.number().int().min(1).max(10000).optional().default(1),
    stockQuantity: z.number().int().min(0).max(10000000).optional().default(0),
    stockStatus: z
      .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ON_ORDER"])
      .optional()
      .default("IN_STOCK"),
    isFeatured: z.boolean().optional().default(false),
    isPublic: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
    isNew: z.boolean().optional().default(false),
    images: z.array(z.string().max(2048)).max(12).optional().default([]),
    categoryId: z.string().min(1).max(100),
    subcategoryId: z.string().max(100).nullable().optional(),
  })
  .strict();

const adminCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug: z.string().trim().min(1).max(140),
    description: z.string().trim().max(1000).optional().nullable(),
    icon: z.string().trim().max(80).optional().nullable(),
    order: z.number().int().min(0).max(10000).optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

app.get("/api/config", (_request, response) => {
  response.json({
    googleAuthEnabled,
    googleRedirectUri,
    emailConfigured: isEmailConfigured(),
    whatsappConfigured: isWhatsAppConfigured(),
    whatsappLinkConfigured: isWhatsAppLinkConfigured(),
  });
});

app.get("/api/notifications", async (request, response) => {
  try {
    const user = await getVerifiedUser(request);
    if (!user) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    const [notifications, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.userNotification.count({
        where: { userId: user.id, readAt: null },
      }),
    ]);
    response.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Failed to load notifications:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger les notifications." });
  }
});

app.put("/api/notifications/read", async (request, response) => {
  try {
    const user = await getVerifiedUser(request);
    if (!user) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    await prisma.userNotification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    response.status(204).end();
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    response
      .status(500)
      .json({ error: "Impossible de mettre à jour les notifications." });
  }
});

app.get("/api/profile", async (request, response) => {
  try {
    const user = await getVerifiedUser(request);
    if (!user) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || "",
      companyName: user.companyName || "",
    });
  } catch (error) {
    console.error("Failed to load profile:", error);
    response.status(500).json({ error: "Impossible de charger votre profil." });
  }
});

app.put("/api/profile", async (request, response) => {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(120),
      phone: z.string().trim().min(5).max(40),
      companyName: z.string().trim().max(160).optional().default(""),
    })
    .strict()
    .safeParse(request.body);
  if (!parsed.success) {
    response
      .status(400)
      .json({ error: "Renseignez votre nom et votre téléphone." });
    return;
  }
  try {
    const user = await getVerifiedUser(request);
    if (!user) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    const profile = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        phone: true,
        companyName: true,
        role: true,
      },
    });
    response.json(profile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    response
      .status(500)
      .json({ error: "Impossible d’enregistrer votre profil." });
  }
});

app.get("/api/cart", async (request, response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            priceUSD: true,
            unit: true,
            images: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    response.json(items.filter((item) => item.product.isActive));
  } catch (error) {
    console.error("Failed to load cart:", error);
    response.status(500).json({ error: "Impossible de charger le panier." });
  }
});

app.put("/api/cart", async (request, response) => {
  const parsed = z
    .object({
      productId: z.string().min(1).max(100).optional(),
      sku: z.string().min(1).max(80).optional(),
      quantity: z.number().int().min(1).max(10000),
    })
    .strict()
    .refine((item) => Boolean(item.productId || item.sku))
    .safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Article de panier invalide." });
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    const product = await prisma.product.findFirst({
      where: {
        isActive: true,
        isPublic: true,
        ...(parsed.data.sku
          ? { sku: parsed.data.sku }
          : { id: parsed.data.productId }),
      },
      select: { id: true, minOrderQuantity: true },
    });
    if (!product) {
      response.status(404).json({ error: "Produit indisponible." });
      return;
    }
    if (parsed.data.quantity < product.minOrderQuantity) {
      response
        .status(400)
        .json({ error: `Quantité minimale : ${product.minOrderQuantity}.` });
      return;
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: session.user.id, productId: product.id },
      },
      create: {
        userId: session.user.id,
        productId: product.id,
        quantity: parsed.data.quantity,
      },
      update: { quantity: parsed.data.quantity },
    });
    response.json(item);
  } catch (error) {
    console.error("Failed to update cart:", error);
    response
      .status(500)
      .json({ error: "Impossible de mettre à jour le panier." });
  }
});

app.delete("/api/cart/:productId", async (request, response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: request.params.productId },
          { sku: request.params.productId },
        ],
      },
      select: { id: true },
    });
    if (product)
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId: product.id },
      });
    response.status(204).end();
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    response.status(500).json({ error: "Impossible de retirer cet article." });
  }
});

app.post("/api/orders", async (request, response) => {
  const parsed = z
    .object({
      notes: z.string().trim().max(2000).optional(),
      items: z
        .array(
          z
            .object({
              productId: z.string().min(1).max(100).optional(),
              sku: z.string().min(1).max(80).optional(),
              quantity: z.number().int().min(1).max(10000),
            })
            .strict()
            .refine((item) => Boolean(item.productId || item.sku)),
        )
        .min(1)
        .max(50)
        .optional(),
    })
    .strict()
    .safeParse(request.body);
  if (!parsed.success) {
    response
      .status(400)
      .json({ error: "Les informations de commande sont invalides." });
    return;
  }

  try {
    const user = await getVerifiedUser(request);
    if (!user) {
      response.status(401).json({
        error: "Connectez-vous avec une adresse vérifiée pour commander.",
      });
      return;
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
      },
    });
    if (!profile?.phone) {
      response.status(400).json({
        code: "PROFILE_INCOMPLETE",
        error:
          "Complétez votre téléphone dans votre profil avant de commander.",
      });
      return;
    }

    const requestedItems: Array<{
      productId?: string;
      sku?: string;
      quantity: number;
    }> =
      parsed.data.items ||
      (await prisma.cartItem.findMany({
        where: { userId: user.id },
        select: { productId: true, quantity: true },
      }));
    if (requestedItems.length === 0) {
      response.status(400).json({ error: "Votre panier est vide." });
      return;
    }

    const productIds = [
      ...new Set(
        requestedItems.flatMap((item) =>
          item.productId ? [item.productId] : [],
        ),
      ),
    ];
    const productSkus = [
      ...new Set(
        requestedItems.flatMap((item) => (item.sku ? [item.sku] : [])),
      ),
    ];
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isPublic: true,
        OR: [
          ...(productIds.length ? [{ id: { in: productIds } }] : []),
          ...(productSkus.length ? [{ sku: { in: productSkus } }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        minOrderQuantity: true,
        priceUSD: true,
        stockQuantity: true,
        stockStatus: true,
        images: true,
      },
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const productsBySku = new Map(
      products.map((product) => [product.sku, product]),
    );

    const orderItems = requestedItems.map((item) => {
      const product =
        (item.productId ? productsById.get(item.productId) : undefined) ||
        (item.sku ? productsBySku.get(item.sku) : undefined);
      if (!product)
        throw new Error("Un produit de la commande n’est plus disponible.");
      if (product.priceUSD === null || product.stockStatus === "OUT_OF_STOCK") {
        throw new Error(`Produit non commandable : ${product.name}`);
      }
      if (item.quantity < product.minOrderQuantity) {
        throw new Error(
          `Quantité minimale pour ${product.name} : ${product.minOrderQuantity}.`,
        );
      }
      if (
        product.stockStatus === "IN_STOCK" &&
        item.quantity > product.stockQuantity
      ) {
        throw new Error(`Stock insuffisant pour ${product.name}.`);
      }
      const unitPrice = Number(product.priceUSD);
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice,
        subtotal: Math.round(unitPrice * item.quantity * 100) / 100,
        image: product.images[0] || null,
      };
    });
    const actualProductIds = [
      ...new Set(orderItems.map((item) => item.productId)),
    ];
    const totalAmount =
      Math.round(
        orderItems.reduce((total, item) => total + item.subtotal, 0) * 100,
      ) / 100;
    const orderNumber = `CMD-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: profile.name,
        customerEmail: profile.email,
        customerPhone: profile.phone,
        notes: parsed.data.notes,
        totalAmount,
        currency: "USD",
        orderDetails: orderItems,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    });
    await prisma.cartItem.deleteMany({
      where: { userId: user.id, productId: { in: actualProductIds } },
    });

    const notifications = await Promise.allSettled([
      sendOrderNotificationEmail({
        orderNumber,
        customerName: profile.name,
        customerEmail: profile.email,
        customerPhone: profile.phone,
        customerCompany: profile.companyName || undefined,
        notes: parsed.data.notes,
        totalAmount,
        currency: "USD",
        items: orderItems,
      }),
    ]);
    const whatsappUrl = isWhatsAppLinkConfigured()
      ? buildOrderWhatsAppUrl({
          orderNumber,
          customerName: profile.name,
          customerEmail: profile.email,
          customerPhone: profile.phone,
          customerCompany: profile.companyName || undefined,
          totalAmount,
          currency: "USD",
          items: orderItems,
        })
      : null;

    response.status(201).json({
      ...order,
      notifications: {
        email:
          notifications[0].status === "fulfilled"
            ? "sent"
            : isEmailConfigured()
              ? "failed"
              : "not_configured",
      },
      whatsappUrl,
      whatsapp: whatsappUrl ? "link_ready" : "not_configured",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      /n’est plus disponible|Produit non commandable|Quantité minimale|Stock insuffisant/.test(
        error.message,
      )
    ) {
      response.status(409).json({ error: error.message });
      return;
    }
    console.error("Failed to create order:", error);
    response
      .status(500)
      .json({ error: "Impossible d’enregistrer la commande." });
  }
});

app.get("/api/orders", async (request, response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    response.json(orders);
  } catch (error) {
    console.error("Failed to load customer orders:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger vos commandes." });
  }
});

app.get("/api/admin/orders", async (request, response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: "Authentification requise." });
      return;
    }
    if (
      session.user.role !== "ADMIN" ||
      session.user.email.trim().toLowerCase() !== "mlimasupplier@gmail.com"
    ) {
      response.status(403).json({ error: "Accès administrateur refusé." });
      return;
    }
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    response.json(orders);
  } catch (error) {
    console.error("Failed to load admin orders:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger les commandes." });
  }
});

app.put("/api/admin/orders/:id/status", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = z
    .object({ status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]) })
    .strict()
    .safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Statut de commande invalide." });
    return;
  }
  try {
    const order = await prisma.order.update({
      where: { id: request.params.id },
      data: { status: parsed.data.status },
    });
    response.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    response.status(404).json({ error: "Commande introuvable." });
  }
});

app.get("/api/admin/products", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    const products = await prisma.product.findMany({
      include: { category: true, subcategory: true },
      orderBy: { updatedAt: "desc" },
    });
    response.json(
      products.map((product) => ({
        ...product,
        priceUSD: product.priceUSD === null ? null : Number(product.priceUSD),
      })),
    );
  } catch (error) {
    console.error("Failed to load admin products:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger le catalogue admin." });
  }
});

app.post("/api/admin/products", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = adminProductSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Fiche produit invalide." });
    return;
  }
  try {
    const data = parsed.data;
    const product = await prisma.product.create({
      data: {
        ...data,
        price: data.priceUSD ?? null,
        stock: data.stockQuantity,
        specifications: data.specifications as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
    await notifyRegisteredUsers(
      "Nouveau produit au catalogue",
      `${product.name} est maintenant disponible dans le catalogue MLIMA Supplier.`,
    );
    response.status(201).json({
      ...product,
      priceUSD: product.priceUSD === null ? null : Number(product.priceUSD),
    });
  } catch (error) {
    console.error("Failed to create product:", error);
    response.status(400).json({
      error: "Produit non créé. Vérifiez la référence et la catégorie.",
    });
  }
});

app.put("/api/admin/products/:id", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = adminProductSchema.partial().safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Fiche produit invalide." });
    return;
  }
  try {
    const data = parsed.data;
    const product = await prisma.product.update({
      where: { id: request.params.id },
      data: {
        ...data,
        ...(data.priceUSD !== undefined ? { price: data.priceUSD } : {}),
        ...(data.stockQuantity !== undefined
          ? { stock: data.stockQuantity }
          : {}),
        ...(data.specifications !== undefined
          ? { specifications: data.specifications as Prisma.InputJsonValue }
          : {}),
      },
    });
    await notifyRegisteredUsers(
      "Catalogue mis à jour",
      `La fiche « ${product.name} » a été mise à jour.`,
    );
    response.json({
      ...product,
      priceUSD: product.priceUSD === null ? null : Number(product.priceUSD),
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    response.status(400).json({
      error: "Produit non mis à jour. Vérifiez la référence et la catégorie.",
    });
  }
});

app.delete("/api/admin/products/:id", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    const product = await prisma.product.delete({
      where: { id: request.params.id },
      select: { name: true },
    });
    await notifyRegisteredUsers(
      "Produit retiré du catalogue",
      `« ${product.name} » n’est plus disponible dans le catalogue.`,
    );
    response.status(204).end();
  } catch (error) {
    console.error("Failed to delete product:", error);
    response
      .status(404)
      .json({ error: "Produit introuvable ou utilisé par une commande." });
  }
});

app.get("/api/admin/categories", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    response.json(
      await prisma.category.findMany({
        include: { subcategories: true },
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    console.error("Failed to load admin categories:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger les catégories admin." });
  }
});

app.post("/api/admin/categories", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = adminCategorySchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Catégorie invalide." });
    return;
  }
  try {
    response
      .status(201)
      .json(await prisma.category.create({ data: parsed.data }));
  } catch (error) {
    console.error("Failed to create category:", error);
    response
      .status(400)
      .json({
        error: "Catégorie non créée. Vérifiez son nom et son identifiant.",
      });
  }
});

app.delete("/api/admin/categories/:id", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    await prisma.category.delete({ where: { id: request.params.id } });
    response.status(204).end();
  } catch (error) {
    console.error("Failed to delete category:", error);
    response
      .status(409)
      .json({
        error:
          "Cette catégorie contient encore des produits ou est introuvable.",
      });
  }
});

app.post(
  "/api/admin/categories/:id/subcategories",
  async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120),
        slug: z.string().trim().min(1).max(140),
      })
      .strict()
      .safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Sous-catégorie invalide." });
      return;
    }
    try {
      response
        .status(201)
        .json(
          await prisma.subcategory.create({
            data: { ...parsed.data, categoryId: request.params.id },
          }),
        );
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      response.status(400).json({ error: "Sous-catégorie non créée." });
    }
  },
);

app.delete(
  "/api/admin/categories/:categoryId/subcategories/:id",
  async (request, response) => {
    if (!(await requireAdmin(request, response))) return;
    try {
      await prisma.subcategory.delete({ where: { id: request.params.id } });
      response.status(204).end();
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      response.status(404).json({ error: "Sous-catégorie introuvable." });
    }
  },
);

app.get("/api/admin/settings", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    response.json(settings);
  } catch (error) {
    console.error("Failed to load admin settings:", error);
    response.status(500).json({ error: "Impossible de charger les réglages." });
  }
});

app.put("/api/admin/settings", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = z
    .object({
      companyName: z.string().trim().min(1).max(160).optional(),
      tagline: z.string().trim().max(240).optional(),
      heroTitle: z.string().trim().max(240).optional(),
      heroSubtitle: z.string().trim().max(1000).optional(),
      emailPrimary: z.string().email().max(320).optional(),
      phonePrimary: z.string().trim().max(40).optional(),
      phoneSecondary: z.string().trim().max(40).optional(),
      whatsappNumber: z.string().trim().max(40).optional(),
      rccm: z.string().trim().max(100).optional(),
      idNat: z.string().trim().max(100).optional(),
      nif: z.string().trim().max(100).optional(),
      bannerNotice: z.string().trim().max(500).nullable().optional(),
      isMaintenance: z.boolean().optional(),
    })
    .safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Paramètres du site invalides." });
    return;
  }
  try {
    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      create: { ...parsed.data, id: "default" },
      update: parsed.data,
    });
    response.json(settings);
  } catch (error) {
    console.error("Failed to save admin settings:", error);
    response
      .status(500)
      .json({ error: "Impossible d’enregistrer les réglages." });
  }
});

app.get("/api/admin/users", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        phone: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    response.json(users);
  } catch (error) {
    console.error("Failed to load admin users:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger les utilisateurs." });
  }
});

app.put("/api/admin/users/:id/role", async (request, response) => {
  if (!(await requireAdmin(request, response))) return;
  const parsed = z
    .object({ role: z.enum(["ADMIN", "CLIENT"]) })
    .strict()
    .safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Rôle utilisateur invalide." });
    return;
  }
  try {
    const target = await prisma.user.findUnique({
      where: { id: request.params.id },
      select: { id: true, email: true },
    });
    if (!target) {
      response.status(404).json({ error: "Utilisateur introuvable." });
      return;
    }
    const isOfficialAdmin =
      target.email.trim().toLowerCase() === "mlimasupplier@gmail.com";
    if (parsed.data.role === "ADMIN" && !isOfficialAdmin) {
      response
        .status(403)
        .json({
          error: "Le rôle administrateur est réservé au compte officiel MLIMA.",
        });
      return;
    }
    const user = await prisma.user.update({
      where: { id: target.id },
      data: { role: isOfficialAdmin ? "ADMIN" : "CLIENT" },
    });
    response.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error("Failed to update user role:", error);
    response.status(500).json({ error: "Impossible de modifier le rôle." });
  }
});

app.get("/api/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error);
    response.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/categories", async (_request, response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            categoryId: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    response.json(categories);
  } catch (error) {
    console.error("Failed to load categories:", error);
    response
      .status(500)
      .json({ error: "Impossible de charger les catégories." });
  }
});

app.get("/api/products", async (request, response) => {
  const querySchema = z
    .object({
      search: z.string().trim().max(120).optional(),
      category: z.string().trim().min(1).max(100).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
    })
    .strict();
  const parsedQuery = querySchema.safeParse(request.query);
  if (!parsedQuery.success) {
    response.status(400).json({ error: "Paramètres de recherche invalides." });
    return;
  }

  const { search = "", category: categorySlug, limit } = parsedQuery.data;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    isPublic: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { shortDesc: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categorySlug
      ? { category: { slug: categorySlug, isActive: true } }
      : {}),
  };

  try {
    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        shortDesc: true,
        description: true,
        specifications: true,
        priceUSD: true,
        isQuoteOnly: true,
        unit: true,
        minOrderQuantity: true,
        stockStatus: true,
        isFeatured: true,
        isNew: true,
        isActive: true,
        isPublic: true,
        images: true,
        categoryId: true,
        subcategoryId: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    response.json(products);
  } catch (error) {
    console.error("Failed to load products:", error);
    response.status(500).json({ error: "Impossible de charger les produits." });
  }
});

app.get('/api/settings', async (_request, response) => {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!settings) {
      response.status(404).json({ error: 'Les paramètres du site ne sont pas configurés.' });
      return;
    }

    response.json({
      companyName: settings.companyName,
      tagline: settings.tagline,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      emailPrimary: settings.emailPrimary,
      phonePrimary: settings.phonePrimary,
      phoneSecondary: settings.phoneSecondary,
      whatsappNumber: settings.whatsappNumber,
      bannerNotice: settings.bannerNotice,
    });
  } catch (error) {
    console.error('Failed to load site settings:', error);
    response.status(500).json({ error: 'Impossible de charger les paramètres du site.' });
  }
});

app.post('/api/quotes', async (request, response) => {
  const quoteSchema = z.object({
    clientName: z.string().trim().min(1).max(120),
    clientEmail: z.string().trim().email().max(320),
    clientPhone: z.string().trim().min(5).max(40),
    clientCompany: z.string().trim().max(160).optional(),
    notes: z.string().trim().max(2000).optional(),
    items: z.array(z.object({
      productId: z.string().min(1).optional(),
      name: z.string().trim().min(1).max(200),
      sku: z.string().trim().max(80).optional(),
      quantity: z.number().int().min(1).max(10000),
      priceUSD: z.number().nonnegative().optional(),
      unit: z.string().trim().max(40).optional(),
      notes: z.string().trim().max(500).optional(),
    }).strict()).min(1).max(50),
  }).strict();
  const parsed = quoteSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Les informations du devis sont invalides.' });
    return;
  }

  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session?.user || !session.user.emailVerified) {
      response.status(401).json({ error: 'Connectez-vous avec une adresse vérifiée pour passer commande.' });
      return;
    }

    const productIds = [...new Set(parsed.data.items.flatMap((item) => item.productId ? [item.productId] : []))];
    const products = productIds.length
      ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, sku: true, priceUSD: true } })
      : [];
    const productsById = new Map(products.map((product) => [product.id, product]));
    const quoteItems = parsed.data.items.map((item) => {
      const product = item.productId ? productsById.get(item.productId) : undefined;
      return {
        productId: product?.id,
        productName: product?.name || item.name,
        productSku: product?.sku || item.sku,
        quantity: item.quantity,
        unitPriceUSD: product?.priceUSD ?? null,
        notes: item.notes,
      };
    });
    const hasVerifiedPrices = quoteItems.every((item) => item.unitPriceUSD !== null);
    const totalEstimated = hasVerifiedPrices
      ? quoteItems.reduce((total, item) => total + Number(item.unitPriceUSD) * item.quantity, 0)
      : null;
    const quoteNumber = `DEV-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const quote = await prisma.quoteRequest.create({
      data: {
        quoteNumber,
        clientName: parsed.data.clientName,
        clientEmail: session.user.email,
        clientPhone: parsed.data.clientPhone,
        clientCompany: parsed.data.clientCompany,
        notes: parsed.data.notes,
        totalEstimated,
        userId: session.user.id,
        items: { create: quoteItems },
      },
      select: { id: true, quoteNumber: true, status: true, createdAt: true },
    });

    const adminEmail = 'mlimasupplier@gmail.com';
    const canEmailAdmin = isEmailConfigured();
    const notificationResults = await Promise.allSettled([
      canEmailAdmin
        ? sendEmail(
            adminEmail!,
            `Nouvelle demande de devis ${quote.quoteNumber}`,
            [
              `Référence : ${quote.quoteNumber}`,
              `Client : ${parsed.data.clientName}`,
              `Entreprise : ${parsed.data.clientCompany || 'Non précisée'}`,
              `Téléphone : ${parsed.data.clientPhone}`,
              `E-mail : ${parsed.data.clientEmail}`,
              'Articles :',
              ...quoteItems.map((item) => `- ${item.quantity} x ${item.productName} (${item.productSku || 'sans référence'})`),
              `Notes : ${parsed.data.notes || 'Aucune'}`,
            ].join('\n'),
          )
        : Promise.reject(new Error('Email notification is not configured.')),
      isWhatsAppConfigured()
        ? sendWhatsAppQuoteNotification({
            quoteNumber: quote.quoteNumber,
            clientName: parsed.data.clientName,
            clientPhone: parsed.data.clientPhone,
            clientEmail: parsed.data.clientEmail,
            items: quoteItems,
          })
        : Promise.reject(new Error('WhatsApp notification is not configured.')),
    ]);
    const notifications = {
      email: notificationResults[0].status === 'fulfilled' ? 'sent' : canEmailAdmin ? 'failed' : 'not_configured',
      whatsapp: notificationResults[1].status === 'fulfilled' ? 'sent' : isWhatsAppConfigured() ? 'failed' : 'not_configured',
    };

    response.status(201).json({ ...quote, notifications });
  } catch (error) {
    console.error('Failed to create quote:', error);
    response.status(500).json({ error: 'Impossible d’enregistrer la demande de devis.' });
  }
});

app.listen(port, () => {
  console.log(`MLIMA API listening on port ${port}`);
});

async function disconnect() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);