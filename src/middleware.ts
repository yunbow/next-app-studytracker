import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // CSRF対策
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    let isValidOrigin = false;
    let isValidReferer = false;

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        isValidOrigin = originHost === host;
      } catch {
        isValidOrigin = false;
      }
    }

    if (referer && host) {
      try {
        const refererHost = new URL(referer).host;
        isValidReferer = refererHost === host;
      } catch {
        isValidReferer = false;
      }
    }

    if (!isValidOrigin && !isValidReferer) {
      return NextResponse.json(
        { error: "Invalid origin or referer" },
        { status: 403 }
      );
    }
  }

  // CSPヘッダー
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // 認証チェック
  const protectedPaths = ["/dashboard", "/timer", "/goals", "/stats", "/profile", "/settings"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next({
    request: { headers: new Headers([...request.headers, ["x-request-id", requestId]]) },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Nonce", nonce);
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
