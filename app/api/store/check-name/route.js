import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ available: true, suggestions: [] });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!slug) {
      return NextResponse.json({ available: false, suggestions: [] });
    }

    const store = await prisma.store.findUnique({
      where: { slug }
    });

    if (!store) {
      return NextResponse.json({ available: true, suggestions: [] });
    }

    // Name is taken! Generate suggestions
    const suggestions = [];
    const suffixes = ['1', '221', 'sn', 'shop', 'boutique'];
    
    for (const suffix of suffixes) {
      if (suggestions.length >= 3) break;
      
      // Capitalize first letter of suffix for display
      const suffixDisplay = suffix.charAt(0).toUpperCase() + suffix.slice(1);
      const proposedName = `${name.trim()} ${suffixDisplay}`;
      const proposedSlug = proposedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const check = await prisma.store.findUnique({
        where: { slug: proposedSlug }
      });
      if (!check) {
        suggestions.push(proposedName);
      }
    }

    return NextResponse.json({ available: false, suggestions });
  } catch (error) {
    console.error('Check store name error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
