"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  BlockView,
  createBlock,
  createPage,
  themeToCssVars,
  Icon,
  type Block,
  type BlockType,
  type Page,
  type Playbook,
  type Theme,
} from "@playbook/index";
import { BlockInspector } from "./BlockInspector";
import { ColorField, IconField, StringListField, TextField } from "@/components/fields";

type InspectorTab = "block" | "page" | "theme" | "meta";

export function EditorClient({ playbook: initial, author }: { playbook: Playbook; author: string }) {
  const [draft, setDraft] = useState<Playbook>(initial);
  const [pageId, setPageId] = useState(initial.pages[0]?.id ?? "");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tab, setTab] = useState<InspectorTab>("page");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [summary, setSummary] = useState("");
  const [submitResult, setSubmitResult] = useState<{ url: string } | { error: string } | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial]);
  const page = draft.pages.find((p) => p.id === pageId) ?? draft.pages[0];
  const selectedBlock = page?.blocks.find((b) => b.id === selectedBlockId) ?? null;

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

  const selectPage = (id: string) => {
    setPageId(id);
    setSelectedBlockId(null);
    setTab("page");
  };

  const addBlock = (type: BlockType) => {
    const block = createBlock(type);
    mutatePage((p) => p.blocks.push(block));
    setSelectedBlockId(block.id);
    setTab("block");
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

  const deleteBlock = (i: number) => {
    mutatePage((p) => p.blocks.splice(i, 1));
    setSelectedBlockId(null);
    setTab("page");
  };

  const addPage = () =>
    mutate((d) => {
      const p = createPage(d.pages.length + 1);
      d.pages.push(p);
      d.nav[0]?.pageIds.push(p.id);
      selectPage(p.id);
    });

  const deletePage = (id: string) => {
    if (draft.pages.length <= 1) return alert("O playbook precisa de pelo menos uma página.");
    mutate((d) => {
      d.pages = d.pages.filter((p) => p.id !== id);
      d.nav.forEach((g) => (g.pageIds = g.pageIds.filter((x) => x !== id)));
    });
    if (pageId === id) setPageId(draft.pages.find((p) => p.id !== id)?.id ?? "");
  };

  async function submit() {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "edit", slug: draft.meta.slug, content: draft, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao submeter");
      setSubmitResult({ url: data.url });
    } catch (e) {
      setSubmitResult({ error: e instanceof Error ? e.message : "Erro desconhecido" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="gh-app-header">
        <Link href="/" className="gh-app-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/pyyne-logo.svg" alt="Pyyne" />
          <span>
            Pyyne <em>/ Greenhouse</em>
          </span>
        </Link>
        <nav className="gh-app-nav">
          <span style={{ fontSize: 13, color: dirty ? "#854F0B" : "#9a9a96" }}>
            {dirty ? "● mudanças não submetidas" : "sem mudanças"}
          </span>
          <Link href={`/playbooks/${draft.meta.slug}`}>Visualizar</Link>
          <button type="button" disabled={!dirty || submitting} onClick={() => setShowSubmit(true)}>
            Submeter para aprovação
          </button>
        </nav>
      </header>

      <div className="gh-container-wide" style={{ flex: 1, width: "100%" }}>
        <div className="gh-editor">
          {/* ── Left: pages + palette ── */}
          <div>
            <div className="gh-editor-panel gh-editor-pages" style={{ marginBottom: 16 }}>
              <h4>Páginas</h4>
              <ul>
                {draft.nav.map((g) => (
                  <React.Fragment key={g.group}>
                    <li style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a9a96", padding: "8px 10px 2px" }}>
                      {g.group}
                    </li>
                    {g.pageIds.map((pid) => {
                      const p = draft.pages.find((x) => x.id === pid);
                      if (!p) return null;
                      return (
                        <li key={pid}>
                          <button type="button" className={pid === page?.id ? "active" : ""} onClick={() => selectPage(pid)}>
                            <Icon name={p.icon} size={14} /> <span style={{ marginLeft: 6 }}>{p.label}</span>
                            <span className="gh-page-ops">
                              <span
                                role="button"
                                title="Remover página"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remover a página "${p.label}"?`)) deletePage(pid);
                                }}
                              >
                                <Icon name="trash" size={13} />
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </React.Fragment>
                ))}
              </ul>
              <button type="button" className="gh-icon-btn" style={{ marginTop: 8, width: "100%" }} onClick={addPage}>
                + Nova página
              </button>
            </div>

            <div className="gh-editor-panel gh-block-palette">
              <h4>Adicionar elemento</h4>
              {BLOCK_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => addBlock(t)}>
                  {BLOCK_LABELS[t].label}
                  <small>{BLOCK_LABELS[t].hint}</small>
                </button>
              ))}
            </div>
          </div>

          {/* ── Center: canvas ── */}
          <div className="gh-editor-canvas">
            <div className="gh-editor-frame" style={themeToCssVars(draft.theme) as React.CSSProperties}>
              <div className="pb-root" style={{ minHeight: 400 }}>
                <div className="pb-main" style={{ overflow: "visible" }}>
                  <div className="pb-section-page visible">
                    <div className="pb-page-eyebrow">{page?.eyebrow}</div>
                    <h1 className="pb-page-title">{page?.title}</h1>
                    <p className="pb-page-subtitle">{page?.subtitle}</p>
                    <div className="pb-page-divider" />
                    {page?.blocks.length === 0 ? (
                      <p style={{ color: "#9a9a96", fontSize: 14, padding: "32px 0", textAlign: "center" }}>
                        Página vazia — adicione um elemento pela paleta à esquerda.
                      </p>
                    ) : null}
                    {page?.blocks.map((b, i) => (
                      <div
                        key={b.id}
                        className={`gh-editor-block${b.id === selectedBlockId ? " selected" : ""}`}
                        onClick={() => {
                          setSelectedBlockId(b.id);
                          setTab("block");
                        }}
                      >
                        <div className="gh-block-toolbar">
                          <button type="button" title="Mover para cima" onClick={(e) => { e.stopPropagation(); moveBlock(i, -1); }}>
                            <Icon name="chevron-up" size={14} />
                          </button>
                          <button type="button" title="Mover para baixo" onClick={(e) => { e.stopPropagation(); moveBlock(i, 1); }}>
                            <Icon name="chevron-down" size={14} />
                          </button>
                          <button type="button" title="Duplicar" onClick={(e) => { e.stopPropagation(); duplicateBlock(i); }}>
                            <Icon name="copy" size={14} />
                          </button>
                          <button type="button" title="Remover" onClick={(e) => { e.stopPropagation(); deleteBlock(i); }}>
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                        <BlockView block={b} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: inspector ── */}
          <div className="gh-editor-panel gh-inspector">
            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
              {(
                [
                  ["block", "Bloco"],
                  ["page", "Página"],
                  ["theme", "Tema"],
                  ["meta", "Meta"],
                ] as [InspectorTab, string][]
              ).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  className="gh-icon-btn"
                  disabled={t === "block" && !selectedBlock}
                  style={tab === t ? { background: "#eef4e8", color: "#35521f", fontWeight: 700 } : undefined}
                  onClick={() => setTab(t)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "block" && selectedBlock ? (
              <>
                <h4>{BLOCK_LABELS[selectedBlock.type].label}</h4>
                <BlockInspector
                  block={selectedBlock}
                  onUpdate={(fn) =>
                    mutatePage((p) => {
                      const b = p.blocks.find((x) => x.id === selectedBlock.id);
                      if (b) fn(b);
                    })
                  }
                />
              </>
            ) : null}

            {tab === "page" && page ? (
              <>
                <h4>Página</h4>
                <TextField label="Rótulo (menu)" value={page.label} onChange={(v) => mutatePage((p) => (p.label = v))} />
                <IconField label="Ícone" value={page.icon} onChange={(v) => mutatePage((p) => (p.icon = v))} />
                <TextField label="Eyebrow" value={page.eyebrow} onChange={(v) => mutatePage((p) => (p.eyebrow = v))} />
                <TextField label="Título" value={page.title} onChange={(v) => mutatePage((p) => (p.title = v))} />
                <TextField label="Subtítulo" multiline value={page.subtitle} onChange={(v) => mutatePage((p) => (p.subtitle = v))} />
                <SelectNavGroup draft={draft} pageId={page.id} onMove={(groupIdx) => mutate((d) => {
                  d.nav.forEach((g) => (g.pageIds = g.pageIds.filter((x) => x !== page.id)));
                  d.nav[groupIdx]?.pageIds.push(page.id);
                })} />
                <TextField
                  label="Grupo de navegação (renomear)"
                  value={draft.nav.find((g) => g.pageIds.includes(page.id))?.group ?? ""}
                  onChange={(v) =>
                    mutate((d) => {
                      const g = d.nav.find((x) => x.pageIds.includes(page.id));
                      if (g) g.group = v;
                    })
                  }
                />
              </>
            ) : null}

            {tab === "theme" ? (
              <>
                <h4>Cores da marca</h4>
                {(
                  [
                    ["brand", "Verde principal"],
                    ["brandDark", "Verde escuro"],
                    ["brandDeep", "Verde profundo"],
                    ["brandLight", "Verde claro"],
                    ["brandMid", "Verde médio"],
                    ["brandSage", "Sálvia (bordas)"],
                    ["brandSoft", "Verde suave"],
                  ] as [keyof Theme["colors"], string][]
                ).map(([k, label]) => (
                  <ColorField
                    key={k}
                    label={label}
                    value={draft.theme.colors[k]}
                    onChange={(v) => mutate((d) => (d.theme.colors[k] = v))}
                  />
                ))}
                <h4 style={{ marginTop: 16 }}>Texto</h4>
                {(
                  [
                    ["ink", "Texto principal"],
                    ["ink2", "Texto secundário"],
                    ["ink3", "Texto terciário"],
                    ["ink4", "Texto suave"],
                    ["surface", "Superfície"],
                    ["surface2", "Fundo"],
                    ["surface3", "Superfície 3"],
                  ] as [keyof Theme["colors"], string][]
                ).map(([k, label]) => (
                  <ColorField
                    key={k}
                    label={label}
                    value={draft.theme.colors[k]}
                    onChange={(v) => mutate((d) => (d.theme.colors[k] = v))}
                  />
                ))}
                <h4 style={{ marginTop: 16 }}>Fontes</h4>
                <TextField label="Títulos (display)" value={draft.theme.fonts.display} onChange={(v) => mutate((d) => (d.theme.fonts.display = v))} />
                <TextField label="Corpo" value={draft.theme.fonts.body} onChange={(v) => mutate((d) => (d.theme.fonts.body = v))} />
                <TextField label="Mono" value={draft.theme.fonts.mono} onChange={(v) => mutate((d) => (d.theme.fonts.mono = v))} />
              </>
            ) : null}

            {tab === "meta" ? (
              <>
                <h4>Metadados do playbook</h4>
                <TextField label="Título" value={draft.meta.title} onChange={(v) => mutate((d) => (d.meta.title = v))} />
                <TextField label="Descrição" multiline value={draft.meta.description} onChange={(v) => mutate((d) => (d.meta.description = v))} />
                <TextField label="Versão" value={draft.meta.version} onChange={(v) => mutate((d) => (d.meta.version = v))} />
                <TextField label="Última atualização" value={draft.meta.lastUpdated} onChange={(v) => mutate((d) => (d.meta.lastUpdated = v))} />
                <TextField label="Favicon (emoji)" value={draft.meta.favicon} onChange={(v) => mutate((d) => (d.meta.favicon = v))} />
                <StringListField
                  label="Tags"
                  items={draft.meta.tags}
                  multiline={false}
                  onChange={(items) => mutate((d) => (d.meta.tags = items))}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Submit modal ── */}
      {showSubmit ? (
        <dialog open>
          <article style={{ maxWidth: 520 }}>
            <h3 style={{ fontSize: 18 }}>Submeter para aprovação</h3>
            {submitResult && "url" in submitResult ? (
              <>
                <p>Sua proposta foi criada e aguarda aprovação de um admin.</p>
                <p>
                  <a href={submitResult.url} target="_blank" rel="noreferrer">
                    Ver pull request no GitHub ↗
                  </a>
                </p>
                <footer>
                  <Link href="/proposals" role="button">Ver propostas</Link>
                  <button type="button" className="secondary" onClick={() => setShowSubmit(false)}>
                    Continuar editando
                  </button>
                </footer>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13.5, color: "#6b6b68" }}>
                  Descreva o que você mudou e por quê. Um admin vai revisar o antes/depois antes de
                  publicar. Autor: <strong>{author}</strong>
                </p>
                <textarea
                  rows={4}
                  placeholder="Ex.: Adicionei uma seção sobre entrevistas de dados e atualizei a matriz de avaliação."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
                {submitResult && "error" in submitResult ? (
                  <p style={{ color: "#A32D2D", fontSize: 13 }}>{submitResult.error}</p>
                ) : null}
                <footer>
                  <button type="button" className="secondary" onClick={() => setShowSubmit(false)}>
                    Cancelar
                  </button>
                  <button type="button" disabled={submitting || summary.trim().length < 4} onClick={submit} aria-busy={submitting}>
                    {submitting ? "Submetendo…" : "Submeter"}
                  </button>
                </footer>
              </>
            )}
          </article>
        </dialog>
      ) : null}
    </div>
  );
}

function SelectNavGroup({
  draft,
  pageId,
  onMove,
}: {
  draft: Playbook;
  pageId: string;
  onMove: (groupIdx: number) => void;
}) {
  const current = draft.nav.findIndex((g) => g.pageIds.includes(pageId));
  return (
    <label>
      Grupo de navegação
      <select value={current} onChange={(e) => onMove(Number(e.target.value))}>
        {draft.nav.map((g, i) => (
          <option key={i} value={i}>
            {g.group}
          </option>
        ))}
      </select>
    </label>
  );
}
