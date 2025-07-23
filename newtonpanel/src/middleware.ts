// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth-token')?.value;
    const userRole = request.cookies.get('user-role')?.value;

    const { pathname } = request.nextUrl;

    // Giriş yapılmamışsa ve korumalı bir sayfaya (panel veya admin) erişmeye çalışıyorsa
    if (!authToken && (pathname.startsWith('/panel') || pathname.startsWith('/admin'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Giriş yapılmışsa
    if (authToken) {
        // Giriş sayfasına gitmeye çalışıyorsa, rolüne göre doğru panele yönlendir
        if (pathname.startsWith('/login')) {
            const targetUrl = userRole === 'admin' ? '/admin' : '/panel';
            return NextResponse.redirect(new URL(targetUrl, request.url));
        }

        // Terapist, admin paneline girmeye çalışıyorsa
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/panel', request.url));
        }

        // Admin, terapist paneline girmeye çalışıyorsa (opsiyonel, belki admin her yere girebilir)
        if (pathname.startsWith('/panel') && userRole === 'admin') {
             return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

// Middleware'in hangi sayfalarda çalışacağını belirtir
export const config = {
    matcher: ['/panel/:path*', '/admin/:path*', '/login'],
};
