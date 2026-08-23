import Link from "next/link";
import { PyyneLogo } from "../brand/PyyneLogo";
import { PhIcon } from "../Icon";
import { getSession, isAuthBypassed } from "@/lib/session";
import { NavLink } from "./NavLink";
import { shell } from "@/styles/shell";

export async function AppSidebar({ proposalsCount }: { proposalsCount?: number }) {
  const session = await getSession();
  const user = session?.user;

  return (
    <aside className={shell.sidebar}>
      <Link href="/" className={shell.brand}>
        <PyyneLogo className="w-8 h-8 shrink-0" />
        <span className={shell.brandName}>Greenhouse</span>
      </Link>

      <Link href="/new" className={shell.newPlaybookBtn}>
        <PhIcon name="plus-circle" className="text-lg" /> New Playbook
      </Link>

      <div className={shell.navSection}>
        <nav className={shell.navGroup}>
          <p className={shell.navLabel}>Archive</p>
          <NavLink href="/" icon="archive-box" label="All Playbooks" exact />
        </nav>

        <nav className={shell.navGroup}>
          <p className={shell.navLabel}>Administration</p>
          <NavLink href="/proposals" icon="git-pull-request" label="Proposals" badge={proposalsCount} />
        </nav>
      </div>

      <div className={shell.userRow}>
        <div className={shell.userChip}>
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" referrerPolicy="no-referrer" className={shell.userAvatar} />
          ) : (
            <span className={`w-8 h-8 ${shell.userAvatar} ${"bg-moss flex items-center justify-center text-forest"}`}>
              <PhIcon name="user" />
            </span>
          )}
          <div className="leading-tight">
            <p className={shell.userName}>{user?.name ?? "Guest"}</p>
            <p className={shell.userRole}>
              {isAuthBypassed() ? "Bypass" : user?.isAdmin ? "Admin" : "Member"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
