// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Tarayıcıdan 'auth-token' cookie'sini oku
    const authToken = request.cookies.get('auth-token')?.value;

    // Korunacak yol (panel ve alt sayfaları)
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/panel');

    // Giriş yapılmamışsa ve korumalı bir sayfaya erişmeye çalışıyorsa
    if (isProtectedRoute && !authToken) {
        // Kullanıcıyı giriş sayfasına yönlendir
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Giriş yapılmışsa ve giriş/kayıt sayfasına gitmeye çalışıyorsa
    if (authToken && (request.nextUrl.pathname.startsWith('/login'))) {
        // Kullanıcıyı doğrudan panele yönlendir
        return NextResponse.redirect(new URL('/panel', request.url));
    }

    // Diğer durumlarda isteğin devam etmesine izin ver
    return NextResponse.next();
}

// Middleware'in hangi sayfalarda çalışacağını belirtir
export const config = {
    matcher: ['/panel/:path*', '/login'],
};