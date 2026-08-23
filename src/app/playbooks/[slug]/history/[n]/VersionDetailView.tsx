"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaybookShell, type Playbook, type ProposalMeta } from "@playbook/index";
import { PhIcon } from "@/components/Icon";
import { ui } from "@/styles/ui";
import { history as hs } from "@/styles/history";

export function VersionDetailView({
  slug,
  prNumber,
  prUrl,
  merged,
  mergedAt,
  meta,
  snapshot,
  current,
}: {
  slug: string;
  prNumber: number;
  prUrl: string;
  merged: boolean;
  mergedAt: string | null;
  meta: ProposalMeta;
  snapshot: Playbook | null;
  current: Playbook | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string | undefined>(undefined);

  const shown = snapshot ?? current;

  async function requestRevert() {
    if (!snapshot) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "edit",
          slug,
          content: snapshot,
          summary: `Revert to the version from PR #${prNumber} (${meta.summary.slice(0, 80)})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create revert proposal");
      router.push(`/proposals/${data.number}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setBusy(false);
    }
  }

  if (!shown) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className={hs.detailHeader}>
        <div className="flex items-center gap-6">
          <Link href={`/playbooks/${slug}/history`} className={hs.detailBack}>
            <PhIcon name="arrow-left" />
            Back to History
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-3">
            <span className={ui.chipPlaybook}>PR #{prNumber}</span>
            <span className={hs.detailMeta}>
              {merged && mergedAt
                ? `Published ${new Date(mergedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "Changes requested (not published)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={hs.detailNote}>
            {snapshot ? "Viewing historical snapshot" : "Snapshot unavailable — showing current version"}
          </span>
          {snapshot ? (
            <button type="button" className={ui.btnDanger} onClick={requestRevert} disabled={busy}>
              {busy ? "Creating proposal…" : "Request Revert to this Version"}
            </button>
          ) : (
            <a href={prUrl} target="_blank" rel="noreferrer" className={ui.btnGhost}>
              View PR ↗
            </a>
          )}
        </div>
      </header>

      {error ? <p className="text-red-600 text-sm px-8 py-2">{error}</p> : null}

      <div className="flex-1">
        <PlaybookShell playbook={shown} activePageId={activePage} onNavigate={setActivePage} />
      </div>
    </div>
  );
}
