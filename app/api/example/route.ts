import { NextRequest, NextResponse } from 'next/server'
import { limiter } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
  const { success, remaining, reset } = limiter.api.check(60, ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    )
  }
  
  // Your API logic here
  return NextResponse.json(
    { message: 'Success' },
    {
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      }
    }
  )
}
