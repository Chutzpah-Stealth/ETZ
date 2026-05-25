import { NextRequest, NextResponse } from "next/server";

// Rotas que pertencem à plataforma (app.etz.com)
const APP_ROUTES = ["/login", "/dashboard"];

// Rotas que pertencem ao site de marketing (etz.com)
const MARKETING_ROUTES = ["/", "/defense", "/business"];

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // Em desenvolvimento local (localhost sem subdomínio), libera todas as rotas
  const isLocalDev = host === "localhost:3000" || host === "localhost";
  if (isLocalDev) return NextResponse.next();

  const isAppSubdomain =
    host.startsWith("app.") ||
    host === "app.localhost:3000" ||
    host === "app.localhost";

  const isAppRoute       = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isMarketingRoute = MARKETING_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // app.etz.com + rota de marketing → redireciona para /login
  if (isAppSubdomain && isMarketingRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // app.etz.com na raiz → redireciona para /login
  if (isAppSubdomain && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // etz.com + rota de plataforma → redireciona para o hub
  if (!isAppSubdomain && isAppRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
