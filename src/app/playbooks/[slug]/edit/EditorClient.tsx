"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  BlockView,
  PageContent,
  createBlock,
  createPage,
  diffPlaybooks,
  themeToCssVars,
  Icon,
  type Block,
  type BlockType,
  type Page,
  type Playbook,
} from "@playbook/index";
import { BlockInspector } from "./BlockInspector";
import { PyyneLogo } from "@/components/brand/PyyneLogo";
import { PhIcon } from "@/components/Icon";
import { ColorField, StringListField, TextField } from "@/components/fields";
import { editor as ed } from "@/styles/editor";
import { ui } from "@/styles/ui";
import type { Theme } from "@playbook/index";

type SubmitState = "idle" | "submitting" | "submitted" | "error";

function bumpMinor(version: string): string {
  const m = /v?(\d+)\.(\d+)/.exec(version);
  return m ? `v${m[1]}.${Number(m[2]) + 1}` : `${version}-draft`;
}

export function EditorClient({
  playbook: initial,
  author,
  mode: editorMode = "edit",
}: {
  playbook: Playbook;
  author: string;
  mode?: "edit" | "create";
}) {
  const isCreate = editorMode === "create";
  const [draft, setDraft] = useState<Playbook>(initial);
  const [pageId, setPageId] = useState(initial.pages[0]?.id ?? "");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const [paletteAt, setPaletteAt] = useState<number | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [summary, setSummary] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitUrl, setSubmitUrl] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial]);
  const diff = useMemo(() => diffPlaybooks(initial, draft), [initial, draft]);
  const draftVersion = useMemo(() => bumpMinor(initial.meta.version), [initial.meta.version]);
  const page = draft.pages.find((p) => p.id === pageId) ?? draft.pages[0];
  const editBlock = page?.blocks.find((b) => b.id === editBlockId) ?? null;

  const mutate = (fn: (d: Playbook) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const mutatePage = (fn: (p: Page) => void) =>
    mutate((d) => {
      const p = d.pages.find((x) => x.id === page.id);
      if (p) fn(p);
    });

  const addBlock = (type: BlockType) => {
    const block = createBlock(type);
    mutatePage((p) => p.blocks.splice(paletteAt ?? p.blocks.length, 0, block));
    setPaletteAt(null);
    setEditBlockId(block.id);
  };

  const moveBlock = (i: number, dir: -1 | 1) =>
    mutatePage((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.blocks.length) return;
      [p.blocks[i], p.blocks[j]] = [p.blocks[j], p.blocks[i]];
    });

  const duplicateBlock = (i: number) =>
    mutatePage((p) => {
      const copy = structuredClone(p.blocks[i]);
      copy.id = `${copy.id}-copy-${Date.now().toString(36)}`;
      p.blocks.splice(i + 1, 0, copy);
    });

  const deleteBlock = (i: number) => mutatePage((p) => p.blocks.splice(i, 1));

  const addPage = () =>
    mutate((d) => {
      const p = createPage(d.pages.length + 1);
      d.pages.push(p);
      d.nav[0]?.pageIds.push(p.id);
      setPageId(p.id);
    });

  const discard = () => {
    setDraft(structuredClone(initial));
    setSubmitState("idle");
    setSubmitError(null);
    setSubmitUrl(null);
  };

  async function submit() {
    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: editorMode, slug: draft.meta.slug, content: draft, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitUrl(data.url);
      setSubmitState("submitted");
      setShowSubmit(false);
      setMode("preview");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
      setSubmitState("error");
    }
  }

  /* Diff lookup for preview highlights */
  const pageDiff = useMemo(() => {
    const map = new Map<string, { changed: Set<string>; removed: Block[] }>();
    for (const pc of diff.pageChanges) {
      if (pc.kind !== "changed") continue;
      const changed = new Set<string>();
      const removed: Block[] = [];
      for (const bc of pc.blockChanges) {
        if (bc.kind === "changed" || bc.kind === "moved") changed.add(bc.blockId);
        if (bc.kind === "added") changed.add(bc.block.id);
        if (bc.kind === "removed") removed.push(bc.block);
      }
      map.set(pc.pageId, { changed, removed });
    }
    return map;
  }, [diff]);

  const changeCount = diff.pageChanges.reduce(
    (acc, pc) => (pc.kind === "changed" ? acc + pc.blockChanges.length + pc.fieldChanges.length : acc + 1),
    0
  ) + diff.metaChanges.length + diff.themeChanges.length;

  const changelogEntries = useMemo(() => {
    const entries: { version: string; date: string; typeLabel: string; changes: string[] }[] = [];
    for (const p of draft.pages) {
      for (const b of p.blocks) {
        if (b.type === "changelog") entries.push(...b.props.entries);
      }
    }
    return entries;
  }, [draft]);

  return (
    <div className={ed.layout}>
      {/* ── Left sidebar ── */}
      <aside className={ed.sidebar}>
        <div className={ed.sidebarHead}>
          <PyyneLogo className="w-6 h-6 shrink-0" />
          <span className={ed.sidebarTitle}>
            Pyyne <span className={ed.sidebarTitleMuted}>/ Editor</span>
          </span>
        </div>

        <div className={ed.sidebarScroll}>
          <div className={ed.sidebarSection}>
            <p className={ed.sidebarLabel}>Navigation</p>
            <nav className="space-y-1">
              <span className={`${ed.navItem} ${ed.navItemActive}`}>
                <span className={ed.navItemInner}>
                  <PhIcon name="layout" className="text-base" /> Current Draft
                </span>
              </span>
              {!isCreate ? (
                <Link href={`/playbooks/${draft.meta.slug}/history`} className={`${ed.navItem} ${ed.navItemIdle}`}>
                  <span className={ed.navItemInner}>
                    <PhIcon name="clock-counter-clockwise" className="text-base" /> Version History
                  </span>
                </Link>
              ) : null}
            </nav>
          </div>

          <div className={ed.sidebarSection}>
            <p className={ed.sidebarLabel}>Pages</p>
            <nav className="space-y-1">
              {draft.pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPageId(p.id)}
                  className={`${ed.navItem} ${p.id === page?.id ? ed.navItemActive : ed.navItemIdle}`}
                >
                  <span className={ed.navItemInner}>
                    <Icon name={p.icon} size={16} /> {p.label}
                  </span>
                </button>
              ))}
              <button type="button" onClick={addPage} className={`${ed.navItem} ${ed.navItemIdle}`}>
                <span className={ed.navItemInner}>
                  <PhIcon name="plus" className="text-base" /> New page
                </span>
              </button>
            </nav>
          </div>

          <div className={ed.sidebarSection}>
            <p className={ed.sidebarLabel}>Playbook</p>
            <nav className="space-y-1">
              <button type="button" onClick={() => setShowSettings(true)} className={`${ed.navItem} ${ed.navItemIdle}`}>
                <span className={ed.navItemInner}>
                  <PhIcon name="gear-six" className="text-base" /> Details & Theme
                </span>
              </button>
            </nav>
          </div>

          <div className={ed.sidebarSection}>
            <p className={ed.sidebarLabel}>Structure</p>
            <nav className="space-y-1">
              {page?.blocks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setEditBlockId(b.id)}
                  className={`${ed.navItem} ${ed.navItemIdle}`}
                >
                  <span className={ed.navItemInner}>{BLOCK_LABELS[b.type].label}</span>
                </button>
              ))}
              {page?.blocks.length === 0 ? (
                <p className="text-xs text-muted px-3">No blocks yet.</p>
              ) : null}
            </nav>
          </div>
        </div>

        <div className={ed.sidebarFoot}>
          {isCreate ? (
            <Link href="/" className={`${ui.btnGhostDanger} block text-center`}>
              Discard Draft
            </Link>
          ) : (
            <button type="button" className={ui.btnGhostDanger} onClick={discard} disabled={!dirty}>
              Discard Changes
            </button>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden ${ed.canvasFaint}`}>
        <header className={ed.topbar}>
            <div className={ed.topbarLeft}>
            <div className="flex items-center gap-2">
              <span className={ed.editingLabel}>{isCreate ? "New Playbook:" : "Editing:"}</span>
              <span className={ed.editingName}>{draft.meta.title}</span>
            </div>
            <div className={ed.topbarDivider} />
            {isCreate ? (
              <span className={ed.newBadge}>
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                New — Draft
              </span>
            ) : (
              <span className={ed.draftBadge}>
                <span className={ed.draftDot} />
                Draft {draftVersion}
              </span>
            )}
          </div>
          <div className={ed.topbarActions}>
            <button type="button" className={ed.previewBtn} onClick={() => setMode(mode === "edit" ? "preview" : "edit")}>
              <PhIcon name="eye" /> {mode === "edit" ? "Preview" : "Back to Editor"}
            </button>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={!dirty || submitState === "submitting" || submitState === "submitted"}
              onClick={() => setShowSubmit(true)}
            >
              Submit Changes
            </button>
          </div>
        </header>

        <div className={ed.canvasWrap}>
          {mode === "edit" ? (
            <>
              <div className={ed.canvas}>
                <article className={ed.article} style={themeToCssVars(draft.theme) as React.CSSProperties}>
                  <div className="pb-root" style={{ background: "transparent", minHeight: 0 }}>
                    {/* Intro banner for freshly planted playbooks */}
                    {isCreate ? (
                      <div className="mb-10 flex items-start gap-4 bg-moss/60 border border-forest/10 rounded-2xl px-6 py-5">
                        <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0 mt-0.5 text-forest">
                          <PhIcon name="sprout" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink mb-1">This playbook was just planted</p>
                          <p className="text-xs text-muted leading-relaxed">
                            Build the first version below — insert blocks, write the content, then submit
                            it for review. An admin approves it before it goes live.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Page header — inline editable */}
                    <div className="mb-12 group relative">
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => mutatePage((p) => (p.eyebrow = e.currentTarget.innerText))}
                        className={`pb-page-eyebrow ${ed.editableFocus}`}
                      >
                        {page?.eyebrow}
                      </p>
                      <h1
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => mutatePage((p) => (p.title = e.currentTarget.innerText))}
                        className={`pb-page-title ${ed.editableFocus}`}
                      >
                        {page?.title}
                      </h1>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => mutatePage((p) => (p.subtitle = e.currentTarget.innerText))}
                        className={`pb-page-subtitle ${ed.editableFocus}`}
                      >
                        {page?.subtitle}
                      </p>
                    </div>

                    {page?.blocks.map((b, i) => (
                      <React.Fragment key={b.id}>
                        <div className={`${ed.blockGroup} mb-6`}>
                          <div className={ed.blockToolbar}>
                            <button type="button" className={ed.blockToolbarBtn} title="Edit block" onClick={() => setEditBlockId(b.id)}>
                              <PhIcon name="pencil-simple" />
                            </button>
                            <button type="button" className={ed.blockToolbarBtn} title="Move up" onClick={() => moveBlock(i, -1)}>
                              <PhIcon name="caret-up" />
                            </button>
                            <button type="button" className={ed.blockToolbarBtn} title="Move down" onClick={() => moveBlock(i, 1)}>
                              <PhIcon name="caret-down" />
                            </button>
                            <button type="button" className={ed.blockToolbarBtn} title="Duplicate" onClick={() => duplicateBlock(i)}>
                              <PhIcon name="copy" />
                            </button>
                            <button type="button" className={ed.blockToolbarBtn} title="Delete" onClick={() => deleteBlock(i)}>
                              <PhIcon name="trash" />
                            </button>
                          </div>
                          <BlockView block={b} />
                        </div>
                        <div className={ed.insertZone} onClick={() => setPaletteAt(i + 1)}>
                          <div className={ed.insertZoneInner}>
                            <PhIcon name="plus-circle" className="text-2xl" />
                            <span className={ed.insertZoneLabel}>Insert New Block</span>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                    {page?.blocks.length === 0 ? (
                      <div className={ed.insertZone} onClick={() => setPaletteAt(0)}>
                        <div className={ed.insertZoneInner}>
                          <PhIcon name="plus-circle" className="text-2xl" />
                          <span className={ed.insertZoneLabel}>Insert New Block</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              </div>

              {/* ── Changelog panel ── */}
              {!isCreate ? (
              <aside className={ed.changelogPanel}>
                <div className={ed.changelogHead}>
                  <h3 className={ed.changelogTitle}>Changelog</h3>
                  <span className={ed.changelogCount}>{changelogEntries.length} versions</span>
                </div>
                <div className={ed.changelogScroll}>
                  {dirty ? (
                    <div className={ed.logItem}>
                      <div className={ed.logDotActive} />
                      <div className="space-y-3">
                        <div className={ed.logLabelRow}>
                          <span className={ed.logLabelActive}>Active Draft</span>
                          <span className={ed.logDate}>now</span>
                        </div>
                        <div className={ed.logCardActive}>
                          <p className={ed.logText}>{changeCount} unsaved change{changeCount === 1 ? "" : "s"} in this draft.</p>
                          <div className={ed.logAuthorRow}>
                            <span className={ed.logAuthor}>{author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {changelogEntries.map((e, i) => (
                    <div key={i} className={i === 0 && !dirty ? ed.logItem : ed.logItemBordered}>
                      {i === 0 && !dirty ? <div className={ed.logDotActive} /> : <div className={ed.logDot} />}
                      <div className="space-y-3">
                        <div className={ed.logLabelRow}>
                          <span className={ed.logLabel}>Version {e.version}</span>
                          <span className={ed.logDate}>{e.date}</span>
                        </div>
                        <div className={ed.logCard}>
                          <p className={ed.logTextMuted}>{e.changes[0] ?? e.typeLabel}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={ed.changelogFoot}>
                  <Link href={`/playbooks/${draft.meta.slug}/history`} className={`${ui.btnDark} block text-center`}>
                    See Full History
                  </Link>
                </div>
              </aside>
              ) : null}
            </>
          ) : (
            /* ── Draft preview mode ── */
            <div className={ed.canvas}>
              <div
                className={`${ed.draftBanner} ${
                  submitState === "submitted" ? ed.draftBannerGreen : submitState === "error" ? ed.draftBannerRed : ed.draftBannerAmber
                } rounded-xl mb-8`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${ed.draftBannerLabel} ${submitState === "error" ? "text-red-700" : submitState === "submitted" ? "text-green-700" : "text-amber-700"}`}>
                    <span className={`w-2 h-2 rounded-full ${submitState === "idle" ? "bg-amber-500 animate-pulse" : submitState === "submitted" ? "bg-green-500" : "bg-red-500"}`} />
                    {submitState === "submitted" ? "Changes submitted" : submitState === "error" ? "Submission failed" : `Draft Preview — ${draftVersion}`}
                  </span>
                  <span className={`${ed.draftBannerText} ${submitState === "error" ? "text-red-600/80" : submitState === "submitted" ? "text-green-600/80" : "text-amber-600/70"}`}>
                    {submitState === "submitted"
                      ? "Your changes have been sent to the reviewers."
                      : submitState === "error"
                        ? (submitError ?? "Something went wrong while submitting your changes.")
                        : "This is how the playbook will look after your edits. Review before submitting."}
                  </span>
                </div>
                {submitState === "submitted" && submitUrl ? (
                  <a href={submitUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-green-700 underline">
                    View pull request ↗
                  </a>
                ) : null}
              </div>

              <article className={ed.article} style={themeToCssVars(draft.theme) as React.CSSProperties}>
                <div className="pb-root" style={{ background: "transparent", minHeight: 0 }}>
                  {draft.pages.map((p) => {
                    const pd = pageDiff.get(p.id);
                    return (
                      <div key={p.id} className="mb-16">
                        <PageContent page={p} />
                        {pd?.removed.map((b) => (
                          <div key={b.id} className={ed.diffRemoved}>
                            <BlockView block={b} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* Floating action bar */}
              <div className={ed.floatBar}>
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Draft {draftVersion}
                </span>
                <div className={ed.floatBarDivider} />
                <span className="text-xs text-white/60">{changeCount} changes from {initial.meta.version}</span>
                <div className={ed.floatBarDivider} />
                <button type="button" className={ed.floatBarBtn} onClick={() => setMode("edit")}>
                  <PhIcon name="pencil-simple" className="text-sm" /> Back to Editor
                </button>
                {submitState !== "submitted" ? (
                  <button type="button" className={ed.floatBarSubmit} onClick={() => setShowSubmit(true)} disabled={!dirty}>
                    <PhIcon name="paper-plane-tilt" className="text-sm" /> Submit for Review
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Block palette modal ── */}
      {paletteAt !== null ? (
        <div className={ed.modalOverlay} onClick={() => setPaletteAt(null)}>
          <div className={ed.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={ed.modalTitle}>Insert block</h3>
            <div className={ed.paletteGrid}>
              {BLOCK_TYPES.map((t) => (
                <button key={t} type="button" className={ed.paletteItem} onClick={() => addBlock(t)}>
                  <span className={ed.paletteItemLabel}>{BLOCK_LABELS[t].label}</span>
                  <span className={ed.paletteItemHint}>{BLOCK_LABELS[t].hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Block inspector modal ── */}
      {editBlock ? (
        <div className={ed.modalOverlay} onClick={() => setEditBlockId(null)}>
          <div className={ed.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={ed.modalTitle}>{BLOCK_LABELS[editBlock.type].label}</h3>
            <BlockInspector
              block={editBlock}
              onUpdate={(fn) =>
                mutatePage((p) => {
                  const b = p.blocks.find((x) => x.id === editBlock.id);
                  if (b) fn(b);
                })
              }
            />
            <div className="flex justify-end mt-4">
              <button type="button" className={ui.btnPrimary} onClick={() => setEditBlockId(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Playbook settings modal (meta + theme) ── */}
      {showSettings ? (
        <div className={ed.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className={ed.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={ed.modalTitle}>Playbook details</h3>
            <TextField label="Title" value={draft.meta.title} onChange={(v) => mutate((d) => (d.meta.title = v))} />
            <TextField label="Description" multiline value={draft.meta.description} onChange={(v) => mutate((d) => (d.meta.description = v))} />
            <TextField label="Version" value={draft.meta.version} onChange={(v) => mutate((d) => (d.meta.version = v))} />
            <TextField label="Last updated" value={draft.meta.lastUpdated} onChange={(v) => mutate((d) => (d.meta.lastUpdated = v))} />
            <TextField label="Favicon (emoji)" value={draft.meta.favicon} onChange={(v) => mutate((d) => (d.meta.favicon = v))} />
            <StringListField label="Tags" items={draft.meta.tags} multiline={false} onChange={(items) => mutate((d) => (d.meta.tags = items))} />

            <h3 className={ed.modalTitle} style={{ marginTop: 24 }}>Theme</h3>
            <div className="grid grid-cols-2 gap-x-4">
              {(
                [
                  ["brand", "Primary green"],
                  ["brandDark", "Dark green"],
                  ["brandDeep", "Deep green"],
                  ["brandLight", "Light green"],
                  ["brandMid", "Mid green"],
                  ["brandSage", "Sage (borders)"],
                  ["brandSoft", "Soft green"],
                  ["ink", "Primary text"],
                  ["ink2", "Secondary text"],
                  ["ink3", "Tertiary text"],
                  ["ink4", "Muted text"],
                  ["surface", "Surface"],
                  ["surface2", "Background"],
                  ["surface3", "Surface 3"],
                ] as [keyof Theme["colors"], string][]
              ).map(([k, label]) => (
                <ColorField
                  key={k}
                  label={label}
                  value={draft.theme.colors[k]}
                  onChange={(v) => mutate((d) => (d.theme.colors[k] = v))}
                />
              ))}
            </div>
            <TextField label="Headings font (display)" value={draft.theme.fonts.display} onChange={(v) => mutate((d) => (d.theme.fonts.display = v))} />
            <TextField label="Body font" value={draft.theme.fonts.body} onChange={(v) => mutate((d) => (d.theme.fonts.body = v))} />
            <TextField label="Mono font" value={draft.theme.fonts.mono} onChange={(v) => mutate((d) => (d.theme.fonts.mono = v))} />

            <div className="flex justify-end mt-4">
              <button type="button" className={ui.btnPrimary} onClick={() => setShowSettings(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Submit modal ── */}
      {showSubmit ? (
        <div className={ed.modalOverlay} onClick={() => setShowSubmit(false)}>
          <div className={ed.modal} style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 className={ed.modalTitle}>Submit for approval</h3>
            <p className="text-sm text-muted mb-4">
              Describe what you changed and why. An admin will review the before/after before
              publishing. Author: <strong>{author}</strong>
            </p>
            <textarea
              rows={4}
              className={ui.input}
              placeholder="e.g.: Added a section about data interviews and updated the evaluation matrix."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            {submitState === "error" && submitError ? (
              <p className="text-red-600 text-xs mt-2">{submitError}</p>
            ) : null}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className={ui.btnText} onClick={() => setShowSubmit(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={ui.btnPrimary}
                disabled={submitState === "submitting" || summary.trim().length < 4}
                onClick={submit}
              >
                {submitState === "submitting" ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
