import { getSession } from "./session";
import { isAdmin } from "./admins";

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.email || !isAdmin(session.user.email)) return null;
  return session;
}
