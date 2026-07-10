const PAYTECH_BASE_URL = 'https://paytech.sn/api/payment';

export async function createPayment({ amount, description, orderId, customerName, customerPhone }) {
  try {
    const response = await fetch(`${PAYTECH_BASE_URL}/request-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': process.env.PAYTECH_API_KEY || 'your-paytech-api-key',
        'API_SECRET': process.env.PAYTECH_API_SECRET || 'your-paytech-api-secret',
      },
      body: JSON.stringify({
        item_name: description,
        item_price: amount,
        currency: 'XOF',
        ref_command: orderId,
        command_name: `Commande ${orderId}`,
        env: process.env.NEXT_PUBLIC_PAYTECH_ENV || 'test',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/success?order=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/cancel?order=${orderId}`,
        ipn_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/webhook`,
        custom_field: JSON.stringify({
          orderId,
          customerName,
          customerPhone,
        }),
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PayTech payment creation failed:', error);
    return { success: 0, error: error.message };
  }
}
