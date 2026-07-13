import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error('Fetch store error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de la boutique' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { storeId, name, slug, description, phone, address, category, logo, banner } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'ID de boutique requis' }, { status: 400 });
    }

    // Vérifier l'unicité du slug si modifié
    if (slug) {
      const existingStore = await prisma.store.findUnique({ where: { slug } });
      if (existingStore && existingStore.id !== storeId) {
        return NextResponse.json({ error: 'Ce lien de boutique (URL) est déjà pris.' }, { status: 400 });
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { name, slug, description, phone, address, category, logo, banner }
    });

    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la boutique' }, { status: 500 });
  }
}
