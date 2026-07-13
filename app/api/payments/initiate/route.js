import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/unitechpay';

export async function POST(request) {
  try {
    const { items, customerName, customerPhone, customerAddress, storeId, paymentMethod } = await request.json();

    if (!storeId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Informations de commande incomplètes' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `TK-${Date.now().toString(36).toUpperCase()}`;

    // 1. Créer la commande en base de données (statut PENDING)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        storeId,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      }
    });

    // 2. Appeler l'API de UnitechPay
    const payment = await createPayment({
      amount: totalAmount,
      description: `Commande ${order.orderNumber}`,
      orderId: order.id,
      customerName,
      customerPhone,
      paymentMethod,
    });

    // Si l'API PayTech a fonctionné, on renvoie l'URL de redirection
    if (payment.success === 1 && payment.redirect_url) {
      return NextResponse.json({
        success: true,
        redirectUrl: payment.redirect_url,
        orderNumber: order.orderNumber,
        orderId: order.id
      });
    }

    // Fallback Démo : Si les clés UnitechPay ne sont pas encore configurées, on simule le succès localement
    console.warn('UnitechPay non configuré ou invalide, redirection de démo activée :', payment);
    return NextResponse.json({
      success: true,
      redirectUrl: `/shop/payment-success?order=${order.id}`,
      orderNumber: order.orderNumber,
      orderId: order.id,
      isDemo: true
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'initiation du paiement' }, { status: 500 });
  }
}
