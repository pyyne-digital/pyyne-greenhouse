import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (middleware). Sem imports de node:fs aqui —
 * a config completa (Google provider + admins) fica em src/lib/auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
