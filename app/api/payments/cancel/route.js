import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order');

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      });
    }

    return NextResponse.redirect(new URL(`/shop/payment-cancel?order=${orderId}`, request.url));
  } catch (error) {
    console.error('Cancel redirect error:', error);
    return NextResponse.json({ error: 'Redirection failed' }, { status: 500 });
  }
}
