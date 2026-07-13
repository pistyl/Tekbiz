import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order');

    if (orderId) {
      // Sécurité Production : En production, les validations de paiement se font exclusivement
      // via les notifications Webhook IPN de PayTech pour éviter toute fraude par appel direct de l'URL.
      if (process.env.NODE_ENV !== 'production') {
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

        // Pour le développement local, on valide immédiatement la commande lors du retour
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED'
          }
        });
      }
    }

    if (orderId && orderId.startsWith('SUB_')) {
      // En production, l'IPN Webhook a déjà validé l'abonnement.
      // On redirige simplement vers les paramètres de la boutique.
      return NextResponse.redirect(new URL(`/dashboard/store?plan=success`, request.url));
    }

    return NextResponse.redirect(new URL(`/shop/payment-success?order=${orderId}`, request.url));
  } catch (error) {
    console.error('Success redirect error:', error);
    return NextResponse.json({ error: 'Redirection failed' }, { status: 500 });
  }
}
