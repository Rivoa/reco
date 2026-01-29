import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'

// 1. Initialize Admin Client for Logging (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const start = Date.now()
  const path = request.nextUrl.pathname

  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ---------------------------------------------------------
  // 1. AUTHENTICATION (Supabase SSR)
  // ---------------------------------------------------------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ---------------------------------------------------------
  // 2. ROUTE PROTECTION
  // ---------------------------------------------------------
  const isApiRoute = path.startsWith('/api')
  const isPublicRoute = path === '/login' || path.startsWith('/auth') 

  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ---------------------------------------------------------
  // 3. API LOGGING (Reliable with waitUntil)
  // ---------------------------------------------------------
  if (isApiRoute) {
    const duration = Date.now() - start
    
    // We use event.waitUntil to ensure the logging finishes 
    // even after the response is sent to the user.
    event.waitUntil(
      supabaseAdmin.from('api_logs').insert({
        path: path,
        method: request.method,
        status_code: 200, 
        duration_ms: duration,
        api_key_used: request.headers.get('x-api-key') || null,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown'
      }).then(({ error }) => {
        if (error) {
          console.error('Supabase Logging Error:', error.message)
        }
      }).catch((err: unknown) => {
        console.error('Middleware Network Error:', err)
      })
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}