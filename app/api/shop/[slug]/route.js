import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, store, products: store.products });
  } catch (error) {
    console.error('Fetch shop error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement de la boutique' }, { status: 500 });
  }
}
