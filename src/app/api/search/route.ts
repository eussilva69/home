
import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/app/actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const allProducts = await getProducts();
    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    return NextResponse.json(filteredProducts.slice(0, 10)); // Return top 10 suggestions
  } catch (error) {
    console.error('Error fetching products for search:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
