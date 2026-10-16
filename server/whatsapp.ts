interface QuoteNotification {
  quoteNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  items: Array<{ productName: string; quantity: number }>;
}

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ADMIN_NUMBER &&
    process.env.WHATSAPP_ADMIN_TEMPLATE,
  );
}

export async function sendWhatsAppQuoteNotification(quote: QuoteNotification) {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER?.replace(/\D/g, '');
  const template = process.env.WHATSAPP_ADMIN_TEMPLATE;
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'fr';

  if (!isWhatsAppConfigured() || !phoneNumberId || !accessToken || !adminNumber || !template) {
    throw new Error('WhatsApp Cloud API is not configured.');
  }

  const itemSummary = quote.items
    .map((item) => `${item.quantity} x ${item.productName}`)
    .join(', ')
    .slice(0, 900);
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminNumber,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: quote.quoteNumber },
            { type: 'text', text: quote.clientName.slice(0, 200) },
            { type: 'text', text: quote.clientPhone.slice(0, 40) },
            { type: 'text', text: quote.clientEmail.slice(0, 200) },
            { type: 'text', text: itemSummary || 'Aucun article précisé' },
          ],
        }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp Cloud API rejected the notification (HTTP ${response.status}).`);
  }
}

interface OrderWhatsAppNotification {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  notes?: string;
  totalAmount: number;
  currency: string;
  items: Array<{ name: string; quantity: number; unit: string; unitPrice: number; image?: string | null }>;
}

export function isWhatsAppLinkConfigured() {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER || '+243993163742';
  const digits = adminNumber.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function buildOrderWhatsAppUrl(order: OrderWhatsAppNotification) {
  const adminNumber = (process.env.ADMIN_WHATSAPP_NUMBER || '+243993163742').replace(/\D/g, '');
  const itemLines = order.items.flatMap((item) => [
    `• ${item.quantity} x ${item.name} (${item.unit}) — ${(item.quantity * item.unitPrice).toFixed(2)} ${order.currency}`,
    ...(item.image ? [`Image : ${item.image}`] : []),
  ]);
  const message = [
    '🛒 *Nouvelle Commande - Mlima Supplier*',
    `Référence : ${order.orderNumber}`,
    `Client : ${order.customerName}`,
    `Email : ${order.customerEmail}`,
    `Téléphone : ${order.customerPhone}`,
    `Organisation : ${order.customerCompany || 'Non précisée'}`,
    ...(order.notes ? [`Précisions : ${order.notes}`] : []),
    '',
    '*Articles :*',
    ...itemLines,
    '',
    `*Total : ${order.totalAmount.toFixed(2)} ${order.currency}*`,
  ].join('\n');
  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
}