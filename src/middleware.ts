import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Mirror of src/lib/session.ts#isAuthBypassed, kept env-only (edge runtime).
function authBypassed(): boolean {
  if (process.env.AUTH_BYPASS === "true") return true;
  if (process.env.AUTH_BYPASS === "false") return false;
  return !process.env.AUTH_GOOGLE_ID;
}

export default NextAuth(authConfig).auth((req) => {
  if (authBypassed()) return NextResponse.next();
  if (!req.auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/playbooks/:slug/edit", "/proposals/:path*", "/new", "/api/proposals/:path*"],
};
