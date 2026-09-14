import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order');

    if (orderId) {
      // Pour les abonnements Pro (SUB_<storeId>), on active immédiatement le plan PRO
      if (orderId.startsWith('SUB_')) {
        const storeId = orderId.substring(4);
        await prisma.store.update({
          where: { id: storeId },
          data: {
            plan: 'PRO',
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
        return NextResponse.redirect(new URL(`/dashboard/store?plan=success`, request.url));
      }

      // Pour le développement local, validation immédiate de la commande normale
      if (process.env.NODE_ENV !== 'production') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED'
          }
        });
      }
    }

    return NextResponse.redirect(new URL(`/shop/payment-success?order=${orderId}`, request.url));
  } catch (error) {
    console.error('Success redirect error:', error);
    return NextResponse.json({ error: 'Redirection failed' }, { status: 500 });
  }
}

