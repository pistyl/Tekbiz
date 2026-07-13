import crypto from 'crypto';

const UNITECHPAY_API_URL = 'https://api.unitech.sn/api.php';

export async function createPayment({ amount, description, orderId, customerName, customerPhone, paymentMethod }) {
  try {
    const apiKey = process.env.UNITECHPAY_API_KEY;
    if (!apiKey) {
      console.warn('UNITECHPAY_API_KEY non configurée.');
      return { success: 0, error: 'API key missing' };
    }

    // Déterminer l'action UnitechPay à appeler
    // Wave: create_wave_payment
    // Orange Money Max It: create_orange_maxit
    const isOrange = paymentMethod === 'orange_money' || paymentMethod === 'orange';
    const action = isOrange ? 'create_orange_maxit' : 'create_wave_payment';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const cleanPhone = customerPhone.replace(/\D/g, '');
    // UnitechPay ajoute le préfixe +221 en interne pour l'API Wave.
    // Il faut donc envoyer uniquement les 9 chiffres locaux (ex: 771234567).
    const customerNumber = cleanPhone.length >= 9 
      ? cleanPhone.substring(cleanPhone.length - 9) 
      : cleanPhone;

    const payload = {
      amount: Math.ceil(amount), // montant entier requis pour la monnaie locale (XOF)
      reference: orderId,
      description: description || `Commande ${orderId}`,
      customer_number: customerNumber, // REQUIS pour UnitechPay
      customer_phone: customerPhone,
      customer_name: customerName,
      phone: customerPhone, // Compatibilité
      callback_url: `${appUrl}/api/payments/webhook`,
      webhook_url: `${appUrl}/api/payments/webhook`, // Compatibilité
      success_url: `${appUrl}/api/payments/success?order=${orderId}`,
      callback_success: `${appUrl}/api/payments/success?order=${orderId}`, // Compatibilité
      cancel_url: `${appUrl}/api/payments/cancel?order=${orderId}`,
      callback_cancel: `${appUrl}/api/payments/cancel?order=${orderId}` // Compatibilité
    };

    console.log(`Calling UnitechPay ${action} with payload:`, JSON.stringify(payload));

    const response = await fetch(`${UNITECHPAY_API_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UnitechPay API HTTP error ${response.status}:`, errorText);
      return { success: 0, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    if (!data.success) {
      console.error('UnitechPay API error response:', data);
      return { success: 0, error: data.message || 'Payment creation failed' };
    }

    const resData = data.data || data;
    const redirectUrl = resData.payment_url || resData.deep_link || resData.redirect_url;

    if (!redirectUrl) {
      console.error('UnitechPay API returned success but no redirect URL:', data);
      return { success: 0, error: 'No redirect URL returned' };
    }

    return {
      success: 1,
      redirect_url: redirectUrl,
      transaction_id: resData.transaction_id || resData.reference
    };
  } catch (error) {
    console.error('UnitechPay payment creation failed:', error);
    return { success: 0, error: error.message };
  }
}

export function verifyWebhookSignature(rawBody, signature) {
  const apiKey = process.env.UNITECHPAY_API_KEY;
  if (!apiKey) {
    console.error('UNITECHPAY_API_KEY non configurée.');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    return expectedSignature === signature;
  }
}
