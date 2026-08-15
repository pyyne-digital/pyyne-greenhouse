"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BlockView,
  themeToCssVars,
  type FieldChange,
  type Playbook,
  type PlaybookDiff,
  type ProposalMeta,
  type TextDiffPart,
} from "@playbook/index";

function DiffText({ parts }: { parts: TextDiffPart[] }) {
  return (
    <span className="gh-diff-text">
      {parts.map((p, i) =>
        p.kind === "added" ? (
          <ins key={i}>{p.value}</ins>
        ) : p.kind === "removed" ? (
          <del key={i}>{p.value}</del>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  );
}

function FieldChangeView({ change }: { change: FieldChange }) {
  return (
    <div className="gh-diff-field">
      <code>{change.path}</code>
      <DiffText parts={change.textDiff} />
    </div>
  );
}

export function ProposalView({
  number,
  url,
  state,
  merged,
  meta,
  before,
  after,
  diff,
  userIsAdmin,
}: {
  number: number;
  url: string;
  state: string;
  merged: boolean;
  meta: ProposalMeta;
  before: Playbook | null;
  after: Playbook;
  diff: PlaybookDiff;
  userIsAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${number}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason }) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setDone(action === "approve" ? "approved" : "rejected");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  const changedPages = diff.pageChanges.filter((p) => p.kind !== "unchanged");

  return (
    <>
      <header className="gh-app-header">
        <Link href="/" className="gh-app-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pyyne-logo.svg" alt="Pyyne" />
          <span>
            Pyyne <em>/ Greenhouse</em>
          </span>
        </Link>
        <nav className="gh-app-nav">
          <Link href="/proposals">← Proposals</Link>
          <a href={url} target="_blank" rel="noreferrer">
            PR #{number} ↗
          </a>
        </nav>
      </header>

      <main className="gh-container">
        <h1 className="gh-page-title" style={{ fontSize: 26 }}>
          {meta.type === "create" ? "New playbook: " : "Changes to "}
          {meta.playbookTitle}
        </h1>
        <p className="gh-page-sub" style={{ marginBottom: 12 }}>
          {meta.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.author.avatar}
              alt=""
              referrerPolicy="no-referrer"
              style={{ width: 20, height: 20, borderRadius: "50%", verticalAlign: "middle", marginRight: 6 }}
            />
          ) : null}
          <strong>{meta.author.name}</strong> ({meta.author.email}) ·{" "}
          {new Date(meta.createdAt).toLocaleString("en-US")}
        </p>
        <p style={{ fontSize: 14, marginBottom: 24 }}>
          <em>“{meta.summary}”</em>
        </p>

        {done ? (
          <div className={`pb-alert ${done === "approved" ? "pb-alert-success" : "pb-alert-warning"}`} style={{ display: "block", padding: 16 }}>
            {done === "approved"
              ? "Proposal approved and merged. Deployment to GitHub Pages runs automatically."
              : "Proposal rejected. The PR was closed with the reason recorded."}
          </div>
        ) : null}

        {userIsAdmin && state === "open" && !done ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            <button type="button" onClick={() => act("approve")} disabled={busy} aria-busy={busy}>
              Approve and publish
            </button>
            <button type="button" className="secondary" onClick={() => setRejecting((v) => !v)} disabled={busy}>
              Reject
            </button>
          </div>
        ) : null}

        {rejecting ? (
          <div style={{ marginBottom: 28 }}>
            <textarea
              rows={3}
              placeholder="Reason for rejection (visible to the author)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" onClick={() => act("reject")} disabled={busy || reason.trim().length < 4}>
              Confirm rejection
            </button>
          </div>
        ) : null}

        {error ? <p style={{ color: "#A32D2D", fontSize: 13, marginBottom: 16 }}>{error}</p> : null}
        {state !== "open" ? (
          <p style={{ fontSize: 13, color: "#6b6b68", marginBottom: 16 }}>
            PR state: {merged ? "merged" : state}
          </p>
        ) : null}

        {!diff.changed ? <p>No content differences detected.</p> : null}

        {diff.metaChanges.length > 0 ? (
          <section className="gh-diff-block">
            <h4>Metadata <span className="gh-diff-tag gh-diff-changed">changed</span></h4>
            {diff.metaChanges.map((c, i) => (
              <FieldChangeView key={i} change={c} />
            ))}
          </section>
        ) : null}

        {diff.themeChanges.length > 0 ? (
          <section className="gh-diff-block">
            <h4>Theme <span className="gh-diff-tag gh-diff-changed">changed</span></h4>
            {diff.themeChanges.map((c, i) => (
              <div className="gh-diff-field" key={i}>
                <code>{c.path}</code>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  {/^#([0-9a-fA-F]{6})$/.test(c.before) ? (
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: c.before, border: "1px solid rgba(0,0,0,.1)" }} />
                  ) : null}
                  <del style={{ color: "#A32D2D" }}>{c.before || "(empty)"}</del> →{" "}
                  {/^#([0-9a-fA-F]{6})$/.test(c.after) ? (
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: c.after, border: "1px solid rgba(0,0,0,.1)" }} />
                  ) : null}
                  <ins style={{ color: "#35521f", textDecoration: "none" }}>{c.after || "(empty)"}</ins>
                </span>
              </div>
            ))}
          </section>
        ) : null}

        {diff.navChanged ? (
          <section className="gh-diff-block">
            <h4>Navigation <span className="gh-diff-tag gh-diff-changed">changed</span></h4>
            <p style={{ fontSize: 13, color: "#6b6b68" }}>
              Page order/grouping changed. Before:{" "}
              {before?.nav.map((g) => `${g.group} [${g.pageIds.join(", ")}]`).join(" · ") ?? "—"} · After:{" "}
              {after.nav.map((g) => `${g.group} [${g.pageIds.join(", ")}]`).join(" · ")}
            </p>
          </section>
        ) : null}

        {changedPages.map((pc) => (
          <section key={pc.kind === "changed" ? pc.pageId : pc.page.id} className="gh-diff-block">
            {pc.kind === "added" ? (
              <>
                <h4>
                  Page “{pc.page.label}” <span className="gh-diff-tag gh-diff-added">new</span>
                </h4>
                <PagePreview playbook={after} pageId={pc.page.id} />
              </>
            ) : pc.kind === "removed" ? (
              <>
                <h4>
                  Page “{pc.page.label}” <span className="gh-diff-tag gh-diff-removed">removed</span>
                </h4>
                <p style={{ fontSize: 13, color: "#6b6b68" }}>The entire page will be removed.</p>
              </>
            ) : pc.kind === "changed" ? (
              <>
                <h4>
                  Page “{pc.label}” <span className="gh-diff-tag gh-diff-changed">changed</span>
                </h4>
                {pc.fieldChanges.map((c, i) => (
                  <FieldChangeView key={i} change={c} />
                ))}
                {pc.blockChanges.map((bc, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    {bc.kind === "added" ? (
                      <>
                        <h4>
                          Block <code>{bc.block.type}</code> <span className="gh-diff-tag gh-diff-added">new</span>
                        </h4>
                        <div style={themeToCssVars(after.theme) as React.CSSProperties} className="pb-root">
                          <BlockView block={bc.block} />
                        </div>
                      </>
                    ) : bc.kind === "removed" ? (
                      <>
                        <h4>
                          Block <code>{bc.block.type}</code> <span className="gh-diff-tag gh-diff-removed">removed</span>
                        </h4>
                        <div
                          style={{ ...(themeToCssVars(before?.theme ?? after.theme) as React.CSSProperties), opacity: 0.6 }}
                          className="pb-root"
                        >
                          <BlockView block={bc.block} />
                        </div>
                      </>
                    ) : bc.kind === "moved" ? (
                      <p style={{ fontSize: 13 }}>
                        Block <code>{bc.blockType}</code> moved from position {bc.from + 1} to {bc.to + 1}.{" "}
                        <span className="gh-diff-tag gh-diff-moved">moved</span>
                      </p>
                    ) : (
                      <>
                        <h4>
                          Block <code>{bc.blockType}</code> <span className="gh-diff-tag gh-diff-changed">changed</span>
                        </h4>
                        {bc.fields.map((f, j) => (
                          <FieldChangeView key={j} change={f} />
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </>
            ) : null}
          </section>
        ))}
      </main>
    </>
  );
}

function PagePreview({ playbook, pageId }: { playbook: Playbook; pageId: string }) {
  const page = playbook.pages.find((p) => p.id === pageId);
  if (!page) return null;
  return (
    <div style={themeToCssVars(playbook.theme) as React.CSSProperties} className="pb-root">
      <div className="pb-section-page visible">
        <div className="pb-page-eyebrow">{page.eyebrow}</div>
        <h1 className="pb-page-title" style={{ fontSize: 24 }}>
          {page.title}
        </h1>
        <p className="pb-page-subtitle" style={{ marginBottom: 16 }}>
          {page.subtitle}
        </p>
        {page.blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}
