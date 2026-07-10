import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des commandes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { items, customerName, customerPhone, customerAddress, storeId, paymentMethod } = await request.json();

    if (!storeId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Informations de commande incomplètes' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: `TK-${Date.now().toString(36).toUpperCase()}`,
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
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { orderId, status, paymentStatus } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId et status requis' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(),
        ...(paymentStatus && { paymentStatus: paymentStatus.toUpperCase() })
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du statut de la commande' }, { status: 500 });
  }
}
