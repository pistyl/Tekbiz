import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (authHeader !== `Bearer ${expectedPassword}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 1. Charger les statistiques globales
    const users = await prisma.user.findMany({
      select: { createdAt: true }
    });
    const productsCount = await prisma.product.count();
    
    // Commandes complétées uniquement pour le chiffre d'affaires boutiques
    const completedOrders = await prisma.order.findMany({
      where: { paymentStatus: 'COMPLETED' },
      select: { createdAt: true, totalAmount: true }
    });
    const totalOrdersRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const stores = await prisma.store.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        _count: {
          select: { products: true, orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const proStoresCount = stores.filter(s => s.plan === 'PRO').length;
    const freeStoresCount = stores.length - proStoresCount;

    // Revenus d'abonnements : 5 000 FCFA par boutique PRO active
    const subscriptionMRR = proStoresCount * 5000;

    return NextResponse.json({
      success: true,
      stats: {
        usersCount: users.length,
        storesCount: stores.length,
        proStoresCount,
        freeStoresCount,
        productsCount,
        ordersCount: completedOrders.length,
        totalOrdersRevenue,
        subscriptionMRR
      },
      rawStats: {
        users: users.map(u => ({ createdAt: u.createdAt })),
        orders: completedOrders.map(o => ({ createdAt: o.createdAt, totalAmount: o.totalAmount }))
      },
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        plan: s.plan,
        subscriptionEnd: s.subscriptionEnd,
        createdAt: s.createdAt,
        owner: s.user,
        productsCount: s._count.products,
        ordersCount: s._count.orders
      }))
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
