import { Resend } from 'resend';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  notes?: string;
  totalAmount: number;
  currency: string;
  items: Array<{ name: string; sku: string; quantity: number; unit: string; unitPrice: number; image?: string | null }>;
}

const officialAdminEmail = 'mlimasupplier@gmail.com';
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminEmail = configuredAdminEmail === officialAdminEmail ? configuredAdminEmail : officialAdminEmail;

export function isEmailConfigured() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();
  const validSender = Boolean(from && /<[^<>\s]+@[^<>\s]+>|^[^<>\s]+@[^<>\s]+$/.test(from));
  return Boolean(
    apiKey && apiKey.startsWith('re_') &&
    from && validSender && !/(example\.com|replace|placeholder)/i.test(from),
  );
}

export async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from || !isEmailConfigured()) {
    throw new Error('Resend requires a valid API key and MAIL_FROM on a verified sender domain.');
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function safeImageUrl(value?: string | null) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? escapeHtml(url.href) : '';
  } catch {
    return '';
  }
}

export async function sendOrderNotificationEmail(order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from || !isEmailConfigured()) {
    throw new Error('Resend requires a valid API key and MAIL_FROM on a verified sender domain.');
  }

  const itemsHtml = order.items.map((item) => {
    const imageUrl = safeImageUrl(item.image);
    return `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #d9e2ec">${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(item.name)}" width="64" height="64" style="display:inline-block;object-fit:cover;vertical-align:middle;margin-right:10px;border-radius:6px">` : ''}${escapeHtml(item.name)} <span style="color:#52677d">(${escapeHtml(item.sku)})</span></td>
      <td style="padding:12px;border-bottom:1px solid #d9e2ec;text-align:center">${item.quantity} ${escapeHtml(item.unit)}</td>
      <td style="padding:12px;border-bottom:1px solid #d9e2ec;text-align:right">${(item.unitPrice * item.quantity).toFixed(2)} ${escapeHtml(order.currency)}</td>
    </tr>`;
  }).join('');
  const html = `
    <div style="margin:0;padding:32px 12px;background:#f3f6fa;font-family:Arial,sans-serif;color:#0A2540">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
        <header style="padding:24px 28px;background:#0B0B0B;color:#ffffff;border-bottom:4px solid #0A2540">
          <p style="margin:0;color:#FFB800;font-size:12px;font-weight:bold;letter-spacing:1px">MLIMA SUPPLIER</p>
          <h1 style="margin:10px 0 0;font-size:22px">Nouvelle commande ${escapeHtml(order.orderNumber)}</h1>
        </header>
        <main style="padding:28px">
          <h2 style="margin:0 0 12px;font-size:16px">Coordonnées du client</h2>
          <p style="margin:6px 0"><strong>Nom :</strong> ${escapeHtml(order.customerName)}</p>
          <p style="margin:6px 0"><strong>E-mail :</strong> ${escapeHtml(order.customerEmail)}</p>
          <p style="margin:6px 0 24px"><strong>Téléphone :</strong> ${escapeHtml(order.customerPhone)}</p>
          ${order.customerCompany ? `<p style="margin:6px 0"><strong>Organisation :</strong> ${escapeHtml(order.customerCompany)}</p>` : ''}
          ${order.notes ? `<p style="margin:6px 0 24px"><strong>Précisions :</strong> ${escapeHtml(order.notes)}</p>` : ''}
          <h2 style="margin:0 0 12px;font-size:16px">Articles commandés</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#0A2540;color:#ffffff"><th style="padding:12px;text-align:left">Produit</th><th style="padding:12px">Quantité</th><th style="padding:12px;text-align:right">Montant</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin:22px 0 0;text-align:right;font-size:18px;font-weight:bold;color:#0A2540">Total : ${order.totalAmount.toFixed(2)} ${escapeHtml(order.currency)}</p>
        </main>
      </div>
    </div>`;
  const text = [
    `Nouvelle commande ${order.orderNumber}`,
    `Client : ${order.customerName}`,
    `E-mail : ${order.customerEmail}`,
    `Téléphone : ${order.customerPhone}`,
    `Organisation : ${order.customerCompany || 'Non précisée'}`,
    ...(order.notes ? [`Précisions : ${order.notes}`] : []),
    ...order.items.flatMap((item) => [
      `${item.quantity} x ${item.name} (${item.sku}) — ${(item.unitPrice * item.quantity).toFixed(2)} ${order.currency}`,
      ...(safeImageUrl(item.image) ? [`Image : ${safeImageUrl(item.image)}`] : []),
    ]),
    `Total : ${order.totalAmount.toFixed(2)} ${order.currency}`,
  ].join('\n');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Nouvelle commande ${order.orderNumber} — MLIMA Supplier`,
    html,
    text,
  });
  if (error) throw new Error(`Resend email failed: ${error.message}`);
}