import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function AppHeader() {
  const session = await auth();
  const user = session?.user;

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
          </span>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
