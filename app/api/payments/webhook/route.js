import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type_event, ref_command, custom_field } = body;

    if (type_event === 'sale_complete') {
      const { orderId } = JSON.parse(custom_field);

      // Mettre à jour le statut de la commande en base de données
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          paymentRef: ref_command,
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayTech webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
