import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret || secret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const superAdminEmail = 'mlimasupplier@gmail.com';
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (configuredAdminEmail && configuredAdminEmail !== superAdminEmail) {
  console.warn('ADMIN_EMAIL differs from the fixed MLIMA Super Admin address and will not be used for role assignment.');
}
const authBaseURL = process.env.BETTER_AUTH_URL?.trim() || 'http://localhost:3001';
const configuredOrigins = [
  process.env.WEB_ORIGIN,
  process.env.APP_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.VITE_APP_URL,
  ...(process.env.WEB_ORIGINS || '').split(','),
  authBaseURL,
].flatMap((value) => {
  if (!value?.trim()) return [];
  try {
    return [new URL(value.trim()).origin];
  } catch {
    console.warn('Ignoring an invalid Better Auth origin configuration.');
    return [];
  }
});
const trustedOrigins = new Set(configuredOrigins);
if (process.env.NODE_ENV !== 'production') {
  for (const host of ['localhost', '127.0.0.1']) {
    for (let port = 3000; port <= 3010; port += 1) trustedOrigins.add(`http://${host}:${port}`);
    trustedOrigins.add(`http://${host}:5173`);
  }
}

export const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);
export const googleRedirectUri = `${authBaseURL.replace(/\/$/, '')}/api/auth/callback/google`;

export const auth = betterAuth({
  appName: 'MLIMA Supplier',
  baseURL: authBaseURL,
  secret,
  trustedOrigins: [...trustedOrigins],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: [],
      allowDifferentEmails: false,
      requireLocalEmailVerified: false,
    },
  },
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'CLIENT', input: false },
      phone: { type: 'string', required: false, input: true },
      companyName: { type: 'string', required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.email.trim().toLowerCase() === superAdminEmail ? 'ADMIN' : 'CLIENT',
          },
        }),
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        'Réinitialisation du mot de passe MLIMA Supplier',
        `Pour choisir un nouveau mot de passe, ouvrez ce lien sécurisé :\n\n${url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        'Vérifiez votre adresse e-mail MLIMA Supplier',
        `Confirmez votre adresse en ouvrant ce lien sécurisé :\n\n${url}`,
      );
    },
  },
  socialProviders: googleAuthEnabled
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          prompt: 'select_account',
        },
      }
    : {},
});