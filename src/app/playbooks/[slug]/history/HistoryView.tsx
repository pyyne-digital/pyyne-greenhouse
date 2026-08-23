"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Playbook } from "@playbook/index";
import type { HistoryEntry } from "@/lib/history";
import { PhIcon } from "@/components/Icon";
import { ui } from "@/styles/ui";
import { history as hs } from "@/styles/history";

type Filter = "all" | "published" | "proposals";

const STATUS_BADGE: Record<HistoryEntry["status"], { label: (e: HistoryEntry) => string; cls: string }> = {
  "in-review": { label: () => "In Review", cls: hs.statusInReview },
  published: { label: (e) => `Published ${e.versionLabel ?? ""}`.trim(), cls: hs.statusPublished },
  rejected: { label: () => "Changes Requested", cls: hs.statusRejected },
  archived: { label: (e) => `Archived ${e.versionLabel ?? ""}`.trim(), cls: hs.statusArchived },
};

const BAR_COLOR: Record<HistoryEntry["status"], string> = {
  "in-review": "bg-amber-500",
  published: "bg-forest",
  rejected: "bg-red-400",
  archived: "bg-border",
};

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function HistoryView({ playbook, entries }: { playbook: Playbook; entries: HistoryEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter === "published" && e.status !== "published") return false;
      if (filter === "proposals" && e.kind !== "proposal") return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, filter, query]);

  const byMonth = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const e of filtered) {
      const key = monthKey(e.date);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <>
      <header className="mb-16">
        <div className={hs.chipRow}>
          <span className={ui.chipVersion}>Version Management</span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span className={hs.playbookName}>{playbook.meta.title}</span>
        </div>
        <h1 className={ui.pageHeading}>Full Version History</h1>
        <p className={ui.pageSubheading}>
          A chronological log of all updates, proposals, and refinements made to the{" "}
          {playbook.meta.title} standards.
        </p>
      </header>

      <div className={hs.filterBar}>
        <div className={hs.filterTabs}>
          {(
            [
              ["all", "All Changes"],
              ["published", "Only Published"],
              ["proposals", "Proposals"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`${hs.filterTab} ${filter === key ? hs.filterTabActive : hs.filterTabIdle}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={hs.searchWrap}>
          <PhIcon name="magnifying-glass" className={hs.searchIcon} />
          <input
            type="text"
            placeholder="Filter by user or message..."
            className={hs.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {byMonth.length === 0 ? (
        <p className="text-muted text-sm">No history entries match this filter.</p>
      ) : (
        byMonth.map(([month, items]) => (
          <div key={month}>
            <div className={hs.monthHeading}>{month}</div>
            <div className="space-y-4">
              {items.map((e, i) => {
                const badge = STATUS_BADGE[e.status];
                const href =
                  e.kind === "proposal" && e.number
                    ? e.status === "in-review"
                      ? `/proposals/${e.number}`
                      : `/playbooks/${playbook.meta.slug}/history/${e.number}`
                    : null;
                return (
                  <div key={`${e.date}-${i}`} className={hs.item}>
                    <div className={`${hs.itemBar} ${BAR_COLOR[e.status]}`} />
                    {e.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.avatar} alt={e.author} className={hs.itemAvatar} referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`${hs.itemAvatar} bg-moss flex items-center justify-center text-forest font-bold`}>
                        {e.author.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className={hs.itemBody}>
                      <div className={hs.itemTopRow}>
                        <div className={hs.itemAuthorRow}>
                          <span className={hs.itemAuthor}>{e.author}</span>
                          <span className={badge.cls}>{badge.label(e)}</span>
                        </div>
                        <span className={hs.itemDate}>{formatDate(e.date)}</span>
                      </div>
                      <h4 className={hs.itemTitle}>{e.title}</h4>
                      {e.summary && e.summary !== e.title ? (
                        <p className={hs.itemSummary}>{e.summary}</p>
                      ) : null}
                    </div>
                    {href ? (
                      <div className="shrink-0">
                        <Link href={href} className={`${hs.itemAction} inline-block`}>
                          {e.status === "in-review" ? "Review" : "View Version"}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </>
  );
}
