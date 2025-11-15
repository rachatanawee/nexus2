import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'th'],
  defaultLocale: 'en'
})

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  const { supabaseResponse, user } = await updateSession(request)
  
  const isAuthPage = pathname.includes('/login')
  const isDashboard = pathname.includes('/dashboard')

  if (!user && isDashboard) {
    const locale = pathname.split('/')[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (user && isAuthPage) {
    const locale = pathname.split('/')[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  const response = intlMiddleware(request)
  
  supabaseResponse.cookies.getAll().forEach(cookie => {
    response.cookies.set(cookie.name, cookie.value)
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
