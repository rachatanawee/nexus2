import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/app/[locale]/(dashboard)/inventory/products/_lib/queries'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const search = request.nextUrl.searchParams.get('search') || ''
  const { data: products, error } = await getProducts()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  let filtered = products || []
  
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower)
    )
  }
  
  return NextResponse.json({ 
    success: true,
    data: filtered,
    total: filtered.length 
  })
}
