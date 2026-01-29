import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'

// 1. Initialize Admin Client for Logging (Bypasses RLS)
// We initialize this outside the function so we don't reconnect on every single request
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
  // We exclude /login and /auth/callback to prevent redirect loops
  const isPublicRoute = path === '/login' || path.startsWith('/auth') 

  // Redirect Logic:
  // If User is NOT logged in AND NOT on a public page AND NOT hitting the API...
  if (!user && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ---------------------------------------------------------
  // 3. API LOGGING (Fixed Type Error)
  // ---------------------------------------------------------
  if (isApiRoute) {
    const duration = Date.now() - start
    
    // We define a standalone async function to handle the logging.
    // This avoids the 'catch does not exist' type error by using standard async/await try-catch blocks.
    const logRequest = async () => {
      try {
        // Try to get key from Header, then Query Param (for proxies)
        const headerKey = request.headers.get('x-api-key');
        const queryKey = request.nextUrl.searchParams.get('key');
        const finalKey = headerKey || queryKey || null;

        const { error } = await supabaseAdmin.from('api_logs').insert({
          path: path,
          method: request.method,
          status_code: 200, 
          duration_ms: duration,
          api_key_used: finalKey,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        })

        if (error) {
          console.error('Supabase Logging Error:', error.message)
        }
      } catch (err) {
        console.error('Middleware Network Error:', err)
      }
    }

    // Execute the function and keep the worker alive until it finishes
    event.waitUntil(logRequest())
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (important to exclude auth callbacks from redirects)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}