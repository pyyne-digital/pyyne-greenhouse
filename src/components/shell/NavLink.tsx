"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhIcon } from "../Icon";
import { shell } from "@/styles/shell";
import { ui } from "@/styles/ui";

export function NavLink({
  href,
  icon,
  label,
  badge,
  exact = false,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${shell.navItem} ${active ? shell.navItemActive : shell.navItemIdle}`}
    >
      <span className={shell.navItemInner}>
        <PhIcon name={icon} /> {label}
      </span>
      {badge !== undefined && badge > 0 ? <span className={ui.badgeCount}>{badge}</span> : null}
    </Link>
  );
}
