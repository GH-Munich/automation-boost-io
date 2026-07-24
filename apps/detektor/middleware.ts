import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sicherheits-Header (H2). Setzt eine nonce-basierte Content-Security-Policy
 * sowie unstrittige Schutz-Header. Der Nonce wird pro Request erzeugt und über
 * einen Request-Header an Next weitergereicht; Next hängt ihn automatisch an
 * seine eigenen Skript-Tags, das Layout an das Theme-Init-Skript.
 *
 * script-src ist nonce-basiert (kein 'unsafe-inline') — der wirksame Schutz
 * gegen XSS. style-src erlaubt 'unsafe-inline', weil die App Inline-Style-
 * Attribute nutzt (z. B. die Fortschrittsbalken-Breite); Style-Injektion ist
 * ungleich weniger gefährlich als Skript-Injektion.
 */
export function middleware(request: NextRequest): NextResponse {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next liest die CSP aus den Request-Headern und noncet seine Skripte selbst.
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Nur die CSP kommt aus der App (nonce muss pro Request hier erzeugt werden).
  // Die statischen Schutz-Header (X-Frame-Options, X-Content-Type-Options,
  // Referrer-Policy, Permissions-Policy, HSTS) setzt der Traefik-Middleware
  // security-headers@docker davor — hier NICHT duplizieren (sonst Doppel-Header).
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  // Statische Assets und Bildoptimierung übergehen — sie brauchen keinen Nonce.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
