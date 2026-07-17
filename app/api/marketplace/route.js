import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const storeId = searchParams.get('storeId') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null;

    // 1. Récupérer toutes les boutiques actives pour les filtres
    const activeStores = await prisma.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        category: true,
      },
      orderBy: { name: 'asc' }
    });

    // 2. Extraire toutes les catégories distinctes des produits des boutiques actives
    const distinctCategories = await prisma.product.findMany({
      where: {
        store: { isActive: true },
        category: {
          not: null,
          not: ''
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    });
    const activeCategories = distinctCategories.map(p => p.category);

    // 3. Construire les conditions de filtre pour les produits
    const whereConditions = {
      store: {
        isActive: true
      }
    };

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (storeId) {
      whereConditions.storeId = storeId;
    }

    if (category) {
      whereConditions.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      whereConditions.price = {};
      if (minPrice !== null) {
        whereConditions.price.gte = minPrice;
      }
      if (maxPrice !== null) {
        whereConditions.price.lte = maxPrice;
      }
    }

    // 4. Récupérer les produits correspondants
    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            phone: true,
            address: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      products,
      stores: activeStores,
      categories: activeCategories
    });

  } catch (error) {
    console.error('Fetch marketplace data error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des données de la marketplace' }, { status: 500 });
  }
}
