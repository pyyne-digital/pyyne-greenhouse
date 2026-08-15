import type { Session } from "next-auth";
import { auth } from "./auth";
import { getAdmins, isAdmin } from "./admins";

/**
 * Temporary auth bypass for local development / pre-launch.
 * Active when AUTH_BYPASS=true, or when Google credentials are absent
 * (and AUTH_BYPASS is not explicitly "false"). Real Google auth takes
 * over automatically once AUTH_GOOGLE_ID/SECRET are set.
 */
export function isAuthBypassed(): boolean {
  if (process.env.AUTH_BYPASS === "true") return true;
  if (process.env.AUTH_BYPASS === "false") return false;
  return !process.env.AUTH_GOOGLE_ID;
}

export async function getSession(): Promise<Session | null> {
  if (isAuthBypassed()) {
    const email = getAdmins().admins[0]?.email ?? "dev@pyyne.com";
    return {
      user: {
        email,
        name: "Dev (auth bypass)",
        image: null,
        isAdmin: isAdmin(email),
      },
      expires: "9999-12-31T23:59:59.999Z",
    } as Session;
  }
  return auth();
}
