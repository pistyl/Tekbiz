import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/paytech';

export async function POST(request) {
  try {
    const { storeId, customerName, customerPhone } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 });
    }

    const orderId = `SUB_${storeId}`;
    const payment = await createPayment({
      amount: 5000,
      description: 'Abonnement Pro TEKBIZ',
      orderId,
      customerName: customerName || 'Propriétaire Boutique',
      customerPhone: customerPhone || '770000000',
    });

    if (payment.success === 1 && payment.redirect_url) {
      return NextResponse.json({
        success: true,
        redirectUrl: payment.redirect_url,
      });
    }

    console.error('Subscription PayTech API failed:', payment);

    // Sécurité Production : pas de déviation ou de validation automatique gratuite
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'Le service de paiement est indisponible pour le moment. Veuillez configurer vos clés API.'
      }, { status: 503 });
    }

    // Fallback Démo (développement uniquement)
    console.warn('PayTech non configuré pour la souscription, redirection locale de démo');
    return NextResponse.json({
      success: true,
      redirectUrl: `/api/payments/success?order=${orderId}`,
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'initiation de l\'abonnement' }, { status: 500 });
  }
}
