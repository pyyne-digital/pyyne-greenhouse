import { AdminsSchema } from "@playbook/schema";
import type { Admins } from "@playbook/types";
import rawAdmins from "@content/admins.json";

// Static import: the JSON is bundled (Vercel redeploys on every push, keeping it fresh).
const admins: Admins = AdminsSchema.parse(rawAdmins);

export function getAdmins(): Admins {
  return admins;
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return admins.admins.some((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function canSelfApprove(email?: string | null): boolean {
  if (!email) return false;
  const admin = admins.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  return admin?.canSelfApprove ?? false;
}
