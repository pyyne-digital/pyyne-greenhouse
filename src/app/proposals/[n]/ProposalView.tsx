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
import type { ProposalComment } from "@/lib/proposals";
import { timeAgo } from "@/lib/time";
import { PhIcon } from "@/components/Icon";
import { ui, changeBadge } from "@/styles/ui";
import { proposals as pr } from "@/styles/proposals";

function DiffText({ parts }: { parts: TextDiffPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.kind === "added" ? (
          <ins key={i} className={ui.diffInserted}>
            {p.value}
          </ins>
        ) : p.kind === "removed" ? (
          <del key={i} className={ui.diffDeleted}>
            {p.value}
          </del>
        ) : (
          <React.Fragment key={i}>{p.value}</React.Fragment>
        )
      )}
    </>
  );
}

function ChangeCard({
  badge,
  badgeClass,
  name,
  context,
  children,
}: {
  badge: string;
  badgeClass: string;
  name: string;
  context: string;
  children: React.ReactNode;
}) {
  return (
    <div className={pr.changeCard}>
      <div className={pr.changeHead}>
        <div className={pr.changeHeadLeft}>
          <span className={`${changeBadge.base} ${badgeClass}`}>{badge}</span>
          <span className={pr.changeName}>{name}</span>
        </div>
        <span className={pr.changeContext}>{context}</span>
      </div>
      <div className={pr.changeBody}>{children}</div>
    </div>
  );
}

function FieldDiff({ change }: { change: FieldChange }) {
  return (
    <div className="mb-4 last:mb-0">
      <code className="block text-[11px] text-neutral-400 mb-1">{change.path}</code>
      <div className={pr.changeText}>
        <DiffText parts={change.textDiff} />
      </div>
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
  comments: initialComments,
  userIsAdmin,
  currentUserName,
}: {
  number: number;
  url: string;
  state: string;
  merged: boolean;
  meta: ProposalMeta;
  before: Playbook | null;
  after: Playbook;
  diff: PlaybookDiff;
  comments: ProposalComment[];
  userIsAdmin: boolean;
  currentUserName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [commentDraft, setCommentDraft] = useState("");

  const open = state === "open" && !merged;
  const changeCount =
    diff.metaChanges.length +
    diff.themeChanges.length +
    diff.pageChanges.reduce(
      (acc, pc) =>
        pc.kind === "changed" ? acc + pc.blockChanges.length + pc.fieldChanges.length : acc + 1,
      0
    );

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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function postComment() {
    if (!commentDraft.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/proposals/${number}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentDraft }),
      });
      if (!res.ok) throw new Error("Failed to post");
      setComments((c) => [
        ...c,
        { id: Date.now(), author: currentUserName, body: commentDraft, createdAt: new Date().toISOString() },
      ]);
      setCommentDraft("");
    } catch {
      setError("Failed to post comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Header ── */}
      <header className={pr.reviewHeader}>
        <div className="flex items-center gap-6">
          <Link href="/proposals" className={pr.backBtn}>
            <PhIcon name="arrow-left" className="text-sm" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-4">
            {meta.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meta.author.avatar} className={pr.reviewAuthorAvatar} alt="Author" referrerPolicy="no-referrer" />
            ) : (
              <div className={`${pr.reviewAuthorAvatar} bg-moss flex items-center justify-center text-forest font-bold`}>
                {meta.author.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className={pr.reviewTitle}>
                {meta.author.name} <span className="text-neutral-400 font-normal">proposed changes to</span>{" "}
                <span className={pr.reviewTitleItalic}>{meta.playbookTitle}</span>
              </div>
              <div className={pr.reviewMeta}>
                {meta.type === "create" ? "New playbook" : "Edit"} • {timeAgo(meta.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {userIsAdmin && open ? (
          <div className={pr.reviewActions}>
            <button type="button" className={ui.btnText} onClick={() => setRejecting((v) => !v)} disabled={busy}>
              Reject with reason
            </button>
            <button type="button" className={ui.btnPrimary} onClick={() => act("approve")} disabled={busy}>
              <PhIcon name="check-circle" /> Approve & Publish
            </button>
          </div>
        ) : null}
      </header>

      {/* ── State banners ── */}
      {merged ? (
        <div className={`${pr.stateBanner} ${pr.statePublished}`}>
          <PhIcon name="check-circle" /> Published — this proposal was merged and deployed.
        </div>
      ) : state === "closed" ? (
        <div className={`${pr.stateBanner} ${pr.stateRejected}`}>
          <PhIcon name="x-circle" /> Changes requested — the author must address them before re-submission.
        </div>
      ) : null}

      <main className={pr.reviewMain}>
        {/* ── Summary ── */}
        <section className={pr.summaryCard}>
          <h4 className={ui.eyebrowWide}>Submission Summary</h4>
          <p className={pr.summaryText}>“{meta.summary}”</p>
        </section>

        {error ? <p className="text-red-600 text-sm">{error}</p> : null}

        {rejecting && open ? (
          <section className={pr.summaryCard}>
            <h4 className={ui.eyebrowWide}>Rejection reason</h4>
            <textarea
              rows={3}
              className={ui.input}
              placeholder="Reason for rejection (visible to the author)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className={ui.btnDanger}
                onClick={() => act("reject")}
                disabled={busy || reason.trim().length < 4}
              >
                Confirm rejection
              </button>
            </div>
          </section>
        ) : null}

        {/* ── Visual diff feed ── */}
        <div className="space-y-10">
          <h4 className={pr.feedLabel}>Visual Diff ({changeCount} changes)</h4>

          {diff.metaChanges.length > 0 ? (
            <ChangeCard badge="Modified" badgeClass={changeBadge.modified} name="Playbook metadata" context="Meta">
              {diff.metaChanges.map((c, i) => (
                <FieldDiff key={i} change={c} />
              ))}
            </ChangeCard>
          ) : null}

          {diff.themeChanges.length > 0 ? (
            <ChangeCard badge="Theme Update" badgeClass={changeBadge.theme} name="Theme tokens" context="Global Style">
              <div className="space-y-4">
                {diff.themeChanges.map((c, i) => (
                  <div key={i} className={pr.swatchRow}>
                    <code className="text-[11px] text-neutral-400 w-48 shrink-0">{c.path}</code>
                    <div className={pr.swatchBox}>
                      {/^#[0-9a-fA-F]{6}$/.test(c.before) ? (
                        <div className={pr.swatchColor} style={{ background: c.before }} />
                      ) : null}
                      <span className={pr.swatchValue}>{c.before || "(empty)"}</span>
                    </div>
                    <PhIcon name="arrow-right" className="text-neutral-300" />
                    <div className={pr.swatchBox}>
                      {/^#[0-9a-fA-F]{6}$/.test(c.after) ? (
                        <div className={pr.swatchColor} style={{ background: c.after }} />
                      ) : null}
                      <span className={`${pr.swatchValue} font-bold text-forest`}>{c.after || "(empty)"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChangeCard>
          ) : null}

          {diff.navChanged ? (
            <ChangeCard badge="Modified" badgeClass={changeBadge.modified} name="Navigation structure" context="Sidebar">
              <p className="text-sm text-neutral-600">
                Before: {before?.nav.map((g) => `${g.group} [${g.pageIds.join(", ")}]`).join(" · ") ?? "—"}
                <br />
                After: {after.nav.map((g) => `${g.group} [${g.pageIds.join(", ")}]`).join(" · ")}
              </p>
            </ChangeCard>
          ) : null}

          {diff.pageChanges
            .filter((pc) => pc.kind !== "unchanged")
            .map((pc) => {
              if (pc.kind === "added") {
                return (
                  <ChangeCard
                    key={pc.page.id}
                    badge="New Page"
                    badgeClass={changeBadge.added}
                    name={pc.page.label}
                    context="Page"
                  >
                    <PagePreview playbook={after} pageId={pc.page.id} />
                  </ChangeCard>
                );
              }
              if (pc.kind === "removed") {
                return (
                  <ChangeCard
                    key={pc.page.id}
                    badge="Removed Page"
                    badgeClass={changeBadge.removed}
                    name={pc.page.label}
                    context="Page"
                  >
                    <p className="text-sm text-neutral-600">The entire page will be removed.</p>
                  </ChangeCard>
                );
              }
              return (
                <React.Fragment key={pc.pageId}>
                  {pc.fieldChanges.length > 0 ? (
                    <ChangeCard
                      badge="Modified"
                      badgeClass={changeBadge.modified}
                      name={`${pc.label} — header`}
                      context={pc.label}
                    >
                      {pc.fieldChanges.map((c, i) => (
                        <FieldDiff key={i} change={c} />
                      ))}
                    </ChangeCard>
                  ) : null}
                  {pc.blockChanges.map((bc, i) => {
                    if (bc.kind === "added") {
                      return (
                        <ChangeCard
                          key={i}
                          badge="New Block"
                          badgeClass={changeBadge.added}
                          name={bc.block.type}
                          context={pc.label}
                        >
                          <div style={themeToCssVars(after.theme) as React.CSSProperties} className="pb-root">
                            <BlockView block={bc.block} />
                          </div>
                        </ChangeCard>
                      );
                    }
                    if (bc.kind === "removed") {
                      return (
                        <ChangeCard
                          key={i}
                          badge="Removed Block"
                          badgeClass={changeBadge.removed}
                          name={bc.block.type}
                          context={pc.label}
                        >
                          <div
                            style={{
                              ...(themeToCssVars(before?.theme ?? after.theme) as React.CSSProperties),
                              opacity: 0.6,
                            }}
                            className="pb-root"
                          >
                            <BlockView block={bc.block} />
                          </div>
                        </ChangeCard>
                      );
                    }
                    if (bc.kind === "moved") {
                      return (
                        <ChangeCard
                          key={i}
                          badge="Moved"
                          badgeClass={changeBadge.moved}
                          name={bc.blockType}
                          context={pc.label}
                        >
                          <p className="text-sm text-neutral-600">
                            Moved from position {bc.from + 1} to {bc.to + 1}.
                          </p>
                        </ChangeCard>
                      );
                    }
                    return (
                      <ChangeCard
                        key={i}
                        badge="Modified"
                        badgeClass={changeBadge.modified}
                        name={bc.blockType}
                        context={pc.label}
                      >
                        {bc.fields.map((f, j) => (
                          <FieldDiff key={j} change={f} />
                        ))}
                      </ChangeCard>
                    );
                  })}
                </React.Fragment>
              );
            })}
        </div>

        {/* ── Comments ── */}
        <div className="space-y-6">
          <h4 className={pr.feedLabel}>Discussion ({comments.length})</h4>
          {comments.map((c) => (
            <div key={c.id} className={pr.commentBubble}>
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} className={pr.commentAvatar} alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className={`${pr.commentAvatar} bg-moss flex items-center justify-center text-forest text-xs font-bold`}>
                  {c.author.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={pr.commentAuthor}>{c.author}</span>
                  <span className={pr.commentTime}>{timeAgo(c.createdAt)}</span>
                </div>
                <p className={pr.commentText}>{c.body}</p>
              </div>
            </div>
          ))}
          {open ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Reply or tag someone..."
                className={pr.commentInput}
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postComment()}
              />
              <button type="button" className={ui.btnPrimary} onClick={postComment} disabled={busy || !commentDraft.trim()}>
                <PhIcon name="paper-plane-tilt" /> Send
              </button>
            </div>
          ) : null}
        </div>
      </main>

      {/* ── Sticky footer (admins, open proposals) ── */}
      {userIsAdmin && open ? (
        <div className={pr.stickyFooter}>
          <div className={pr.stickyBar}>
            <div className={pr.stickyNote}>
              <div className={pr.stickyNoteIcon}>
                <PhIcon name="info" className="text-xs" />
              </div>
              Approving publishes to GitHub Pages automatically.
            </div>
            <div className="flex gap-4">
              <a href={url} target="_blank" rel="noreferrer" className={pr.stickyDiscard}>
                View PR ↗
              </a>
              <button type="button" className={pr.stickyApprove} onClick={() => act("approve")} disabled={busy}>
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PagePreview({ playbook, pageId }: { playbook: Playbook; pageId: string }) {
  const page = playbook.pages.find((p) => p.id === pageId);
  if (!page) return null;
  return (
    <div style={themeToCssVars(playbook.theme) as React.CSSProperties} className="pb-root">
      <div className="pb-section-page visible">
        <div className="pb-page-eyebrow">{page.eyebrow}</div>
        <h1 className="pb-page-title" style={{ fontSize: 28 }}>
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
