import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order');

    if (orderId) {
      // Pour le développement local, on valide immédiatement la commande lors du retour
      // car le webhook de PayTech ne peut pas atteindre une adresse en localhost.
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });
    }

    return NextResponse.redirect(new URL(`/shop/payment-success?order=${orderId}`, request.url));
  } catch (error) {
    console.error('Success redirect error:', error);
    return NextResponse.json({ error: 'Redirection failed' }, { status: 500 });
  }
}
