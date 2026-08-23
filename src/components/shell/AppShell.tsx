import React from "react";
import { AppSidebar } from "./AppSidebar";
import { shell } from "@/styles/shell";

/**
 * App shell: fixed left sidebar + scrollable content area.
 * Used by all Greenhouse screens (home, proposals, history, …).
 */
export function AppShell({
  children,
  proposalsCount,
}: {
  children: React.ReactNode;
  proposalsCount?: number;
}) {
  return (
    <div className={shell.layout}>
      <AppSidebar proposalsCount={proposalsCount} />
      <main className={shell.content}>{children}</main>
    </div>
  );
}
