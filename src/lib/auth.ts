import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAdmin } from "./admins";

const ALLOWED_DOMAIN = "pyyne.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email;
      return Boolean(profile?.email_verified && email?.endsWith(`@${ALLOWED_DOMAIN}`));
    },
    jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      if (token.email) token.isAdmin = isAdmin(token.email as string);
      return token;
    },
    session({ session, token }) {
      if (token.isAdmin !== undefined) session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
});
