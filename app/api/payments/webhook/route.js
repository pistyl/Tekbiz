import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/unitechpay';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-unitechpay-signature');

    if (!signature) {
      console.warn('Webhook received without signature header');
      return NextResponse.json({ error: 'Signature header missing' }, { status: 401 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, reference, status, transaction_id } = body;

    if (event === 'payment_completed' && status === 'completed') {
      const orderId = reference;

      if (orderId && orderId.startsWith('SUB_')) {
        const storeId = orderId.substring(4);
        await prisma.store.update({
          where: { id: storeId },
          data: {
            plan: 'PRO',
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
        console.log(`Plan PRO activé pour la boutique : ${storeId}`);
      } else {
        // Mettre à jour le statut de la commande en base de données
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED',
            paymentRef: String(transaction_id || ''),
          }
        });
        console.log(`Commande confirmée et payée : ${orderId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('UnitechPay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
