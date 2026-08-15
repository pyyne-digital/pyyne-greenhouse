import Link from "next/link";
import { signOut } from "@/lib/auth";
import { getSession, isAuthBypassed } from "@/lib/session";

export async function AppHeader() {
  const session = await getSession();
  const user = session?.user;
  const bypass = isAuthBypassed();

  return (
    <header className="gh-app-header">
      <Link href="/" className="gh-app-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/pyyne-logo.svg" alt="Pyyne" />
        <span>
          Pyyne <em>/ Greenhouse</em>
        </span>
      </Link>
      <nav className="gh-app-nav">
        <Link href="/">Playbooks</Link>
        <Link href="/proposals">Proposals</Link>
        <Link href="/new">New playbook</Link>
        {user ? (
          <span className="gh-user-chip">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" referrerPolicy="no-referrer" />
            ) : null}
            {user.name}
            {user.isAdmin ? <span className="gh-admin-badge">admin</span> : null}
            {bypass ? (
              <span className="gh-admin-badge" style={{ background: "#FAEEDA", color: "#854F0B", borderColor: "#FAC775" }}>
                bypass
              </span>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
                style={{ display: "inline" }}
              >
                <button type="submit" className="gh-icon-btn" style={{ fontSize: 12 }}>
                  Sign out
                </button>
              </form>
            )}
          </span>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
