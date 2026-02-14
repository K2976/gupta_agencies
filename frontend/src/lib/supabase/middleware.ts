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
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const dashboardPath =
                        profile.role === 'super_admin'
                            ? '/admin'
                            : profile.role === 'salesman'
                                ? '/salesman'
                                : '/retailer';
                    return NextResponse.redirect(new URL(dashboardPath, request.url));
                }
            }
            return supabaseResponse;
        }

        // Protected paths — require auth
        if (!user) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Role-based path protection
        const { data: profile } = await supabase
            .from('users')
            .select('role, is_active')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_active) {
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/', request.url));
        }

        const rolePathMap: Record<string, string> = {
            super_admin: '/admin',
            salesman: '/salesman',
            retailer: '/retailer',
        };

        const allowedPrefix = rolePathMap[profile.role];
        if (allowedPrefix && !path.startsWith(allowedPrefix) && !path.startsWith('/api')) {
            return NextResponse.redirect(new URL(allowedPrefix, request.url));
        }

        return supabaseResponse;
    } catch (e) {
        // AbortError is normal during dev HMR — ignore silently
        if (e instanceof Error && e.name === 'AbortError') {
            return supabaseResponse;
        }
        // For any other error, let the request through rather than crashing
        return supabaseResponse;
    }
}
