import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId est requis' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, price, description, category, stock, storeId, images } = await request.json();

    if (!storeId || !name || !price) {
      return NextResponse.json({ error: 'Informations incomplètes' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        description,
        category,
        quantity: parseInt(stock) || 0,
        inStock: parseInt(stock) > 0,
        storeId,
        images: images || []
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}
