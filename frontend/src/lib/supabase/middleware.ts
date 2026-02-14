import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({ request });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const path = request.nextUrl.pathname;

        // Public paths that don't require auth
        if (path === '/' || path === '/auth/login') {
            if (user) {
                // Check cached role cookie first (avoids DB roundtrip)
                const cachedRole = request.cookies.get('user_role')?.value;
                if (cachedRole && ['super_admin', 'salesman', 'retailer'].includes(cachedRole)) {
                    const dashboardPath =
                        cachedRole === 'super_admin' ? '/admin'
                            : cachedRole === 'salesman' ? '/salesman'
                                : '/retailer';
                    return NextResponse.redirect(new URL(dashboardPath, request.url));
                }

                // Fallback: query profile (only on first login before cookie is set)
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const dashboardPath =
                        profile.role === 'super_admin' ? '/admin'
                            : profile.role === 'salesman' ? '/salesman'
                                : '/retailer';
                    const response = NextResponse.redirect(new URL(dashboardPath, request.url));
                    // Cache role in cookie for fast subsequent requests
                    response.cookies.set('user_role', profile.role, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 60 * 60 * 24, // 24 hours
                        path: '/',
                    });
                    return response;
                }
            }
            return supabaseResponse;
        }

        // Protected paths — require auth
        if (!user) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('user_role');
            return response;
        }

        // Role-based path protection — use cached cookie (no DB roundtrip)
        let role: string | undefined = request.cookies.get('user_role')?.value;

        if (!role || !['super_admin', 'salesman', 'retailer'].includes(role)) {
            // Cache miss — query DB once and cache
            const { data: profile } = await supabase
                .from('users')
                .select('role, is_active')
                .eq('id', user.id)
                .single();

            if (!profile || !profile.is_active) {
                await supabase.auth.signOut();
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('user_role');
                return response;
            }
            role = profile.role as string;

            // Cache the role for future requests
            supabaseResponse.cookies.set('user_role', role, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
                path: '/',
            });
        }

        const rolePathMap: Record<string, string> = {
            super_admin: '/admin',
            salesman: '/salesman',
            retailer: '/retailer',
        };

        const allowedPrefix = role ? rolePathMap[role] : undefined;
        if (allowedPrefix && !path.startsWith(allowedPrefix) && !path.startsWith('/api')) {
            return NextResponse.redirect(new URL(allowedPrefix, request.url));
        }

        return supabaseResponse;
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            return supabaseResponse;
        }
        return supabaseResponse;
    }
}
