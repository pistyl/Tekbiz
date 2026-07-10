import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, email, phone, password, storeName, storeCategory } = await request.json();

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }

    // Générer le slug
    const slug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slugExists = await prisma.store.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: 'Nom de boutique déjà pris' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur + boutique
    const user = await prisma.user.create({
      data: {
        name, email, phone,
        password: hashedPassword,
        store: {
          create: { name: storeName, slug, category: storeCategory, phone }
        }
      },
      include: { store: true }
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, store: user.store }
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 });
  }
}
