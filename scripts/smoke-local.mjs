const apiUrl = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
const appUrl = process.env.APP_URL?.replace(/\/$/, '');
const failures = [];

async function check(name, action) {
  try {
    const result = await action();
    console.log(`PASS ${name}${result ? `: ${result}` : ''}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

await check('API health and database', async () => {
  const response = await fetch(`${apiUrl}/api/health`);
  const body = await response.json();
  if (!response.ok || body.status !== 'ok' || body.database !== 'connected') throw new Error(`HTTP ${response.status}`);
  return 'database connected';
});

await check('public product catalog', async () => {
  const response = await fetch(`${apiUrl}/api/products?limit=1`);
  const products = await response.json();
  if (!response.ok || !Array.isArray(products)) throw new Error(`HTTP ${response.status}`);
  return `${products.length} sample product(s)`;
});

for (const path of [
  "/api/profile",
  "/api/notifications",
  "/api/cart",
  "/api/orders",
  "/api/admin/orders",
  "/api/admin/products",
  "/api/admin/categories",
  "/api/admin/users",
  "/api/admin/settings",
]) {
  await check(`${path} rejects anonymous access`, async () => {
    const response = await fetch(`${apiUrl}${path}`);
    if (response.status !== 401)
      throw new Error(`expected 401, received ${response.status}`);
    return "401";
  });
}

if (appUrl) {
  await check('frontend is reachable', async () => {
    const response = await fetch(appUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return 'HTTP 200';
  });
} else {
  console.log('SKIP frontend: define APP_URL to check the Vite page');
}

try {
  const response = await fetch(`${apiUrl}/api/config`);
  const config = await response.json();
  console.log(`INFO Google OAuth: ${config.googleAuthEnabled ? 'configured' : 'not configured'}`);
  console.log(`INFO Resend: ${config.emailConfigured ? 'configured' : 'not configured'}`);
  console.log(`INFO WhatsApp Cloud: ${config.whatsappConfigured ? 'configured' : 'not configured'}`);
  console.log(`INFO WhatsApp link: ${config.whatsappLinkConfigured ? 'ready' : 'not configured'}`);
} catch {
  failures.push('API config');
  console.error('FAIL API config');
}

if (failures.length) process.exitCode = 1;
