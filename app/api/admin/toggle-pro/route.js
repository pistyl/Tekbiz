import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (authHeader !== `Bearer ${expectedPassword}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { storeId, action, durationDays = 30 } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'ID boutique requis' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
    }

    let updatedStore;

    if (action === 'ACTIVATE_PRO' || action === 'EXTEND_PRO') {
      const baseDate = (action === 'EXTEND_PRO' && store.subscriptionEnd && new Date(store.subscriptionEnd) > new Date())
        ? new Date(store.subscriptionEnd)
        : new Date();

      const newEnd = new Date(baseDate.getTime() + (parseInt(durationDays) || 30) * 24 * 60 * 60 * 1000);

      updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          plan: 'PRO',
          subscriptionEnd: newEnd
        }
      });
    } else if (action === 'SET_FREE') {
      updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          plan: 'FREE',
          subscriptionEnd: null
        }
      });
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        slug: updatedStore.slug,
        plan: updatedStore.plan,
        subscriptionEnd: updatedStore.subscriptionEnd
      }
    });
  } catch (error) {
    console.error('Admin toggle-pro API error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du plan' }, { status: 500 });
  }
}
