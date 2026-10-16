import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/navigation';

/**
 * =============================================================================
 * NEXT.JS MIDDLEWARE DE PROTECTION DES ROUTES & GESTION DES RÔLES
 * MLIMA SUPPLIER — AVEC BETTER AUTH (Email/Mot de passe & Rôles RBAC)
 * =============================================================================
 * Rôles :
 * - VISITEUR (Non authentifié) : Accès restreint au catalogue public.
 * - CLIENT (Inscrit / role: 'CLIENT') : Accès aux prix, Panies, /dashboard, /checkout.
 * - ADMIN (Administrateur / role: 'ADMIN') : Accès total au Back-Office /admin.
 * =============================================================================
 */

// Routes réservées aux utilisateurs authentifiés
const PROTECTED_CLIENT_ROUTES = ['/dashboard', '/checkout', '/orders', '/quotes', '/profile'];

// Routes réservées exclusivement aux administrateurs
const PROTECTED_ADMIN_ROUTES = ['/admin', '/admin/products', '/admin/categories', '/admin/users', '/admin/settings'];

// Routes d'authentification publique (inaccessibles une fois connecté)
const AUTH_ROUTES = ['/login', '/register', '/auth/signin', '/auth/signup'];

interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CLIENT';
  };
  session: {
    id: string;
    expiresAt: string;
    token: string;
  };
}

/**
 * Récupère la session Better Auth de manière sécurisée côté Edge Middleware
 * Vérifie le cookie de session Better Auth ou interroge l'API interne Better Auth
 */
async function getBetterAuthSession(request: NextRequest): Promise<BetterAuthSession | null> {
  const sessionCookie =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Appel au endpoint interne de vérification de session Better Auth
    const authUrl = new URL('/api/auth/get-session', request.url);
    const response = await fetch(authUrl, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as BetterAuthSession;
  } catch (err) {
    console.error('[Middleware] Erreur vérification session Better Auth:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getBetterAuthSession(request);
  const isAuthenticated = Boolean(session && session.user);
  const userRole = session?.user?.role; // 'ADMIN' | 'CLIENT' | undefined

  // ---------------------------------------------------------------------------
  // CAS 1 : Utilisateur NON inscrit / NON connecté
  // S'il essaie d'accéder au Dashboard Client, Checkout ou Back-Office Admin :
  // Redirection automatique vers /login avec message d'avertissement et callbackUrl
  // ---------------------------------------------------------------------------
  const isTargetingClientProtected = PROTECTED_CLIENT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isTargetingAdminProtected = PROTECTED_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAuthenticated && (isTargetingClientProtected || isTargetingAdminProtected)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    loginUrl.searchParams.set(
      'error',
      isTargetingAdminProtected ? 'admin_auth_required' : 'auth_required'
    );
    loginUrl.searchParams.set(
      'message',
      isTargetingAdminProtected
        ? "Veuillez vous connecter avec vos identifiants d'administrateur MLIMA pour accéder au panneau d'administration."
        : 'Veuillez vous connecter ou créer un compte MLIMA Supplier pour accéder aux prix, passer commande ou demander un devis.'
    );
    return NextResponse.redirect(loginUrl);
  }

  // ---------------------------------------------------------------------------
  // CAS 2 : Utilisateur DÉJÀ inscrit et connecté
  // S'il tente d'accéder aux pages /login ou /register :
  // Redirection automatique selon son rôle
  // ---------------------------------------------------------------------------
  const isTargetingAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthenticated && isTargetingAuthRoute) {
    if (userRole === 'ADMIN') {
      // Redirection automatique de l'ADMIN vers le Back-Office
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Redirection automatique du CLIENT vers l'accueil ou le catalogue
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const destination = callbackUrl && !callbackUrl.startsWith('/login') ? callbackUrl : '/';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ---------------------------------------------------------------------------
  // CAS 3 : Client connecté (role: 'CLIENT') tentant d'accéder à l'Admin
  // Redirection immédiate vers une page 403 / non autorisé ou accueil avec alerte
  // ---------------------------------------------------------------------------
  if (isAuthenticated && userRole === 'CLIENT' && isTargetingAdminProtected) {
    const unauthorizedUrl = new URL('/', request.url);
    unauthorizedUrl.searchParams.set('error', 'forbidden_admin_access');
    unauthorizedUrl.searchParams.set(
      'message',
      "Accès 403 refusé : Votre compte client n'a pas les droits nécessaires pour administrer la plateforme MLIMA Supplier."
    );
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Permettre l'accès pour les requêtes autorisées
  return NextResponse.next();
}

/**
 * Matcher de configuration : applique le middleware sur toutes les routes
 * à l'exception des assets statiques, images, favicon et endpoints d'authentification API.
 */
export const config = {
  matcher: [
    /*
     * Intercepte toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico, sitemap.xml, robots.txt
     * - api/auth (endpoints d'authentification Better Auth)
     * - images publiques / extensions courantes (.svg, .png, .jpg, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
