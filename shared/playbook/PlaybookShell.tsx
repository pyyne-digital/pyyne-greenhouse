import React from "react";
import type { Page, Playbook } from "./types";
import { themeToCssVars } from "./theme";
import { Icon } from "./icons";
import { BlockView } from "./blocks";

export function PageContent({ page }: { page: Page }) {
  return (
    <>
      <div className="pb-page-eyebrow">{page.eyebrow}</div>
      <h1 className="pb-page-title">{page.title}</h1>
      <p className="pb-page-subtitle">{page.subtitle}</p>
      <div className="pb-page-divider" />
      {page.blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="100,10 170,170 100,135" fill="#4b6332" />
      <polygon points="100,10 30,170 100,135" fill="#8aad6e" />
      <polygon points="30,170 100,135 170,170" fill="#c5d9b0" />
      <polygon points="100,135 55,175 30,170" fill="#a3b18a" />
      <polygon points="100,135 145,175 170,170" fill="#d4e6c3" />
    </svg>
  );
}

/**
 * Full playbook layout (sidebar + topbar + pages).
 * `activePageId` / `onNavigate` make it interactive in the web app;
 * the static build renders all pages and toggles visibility with JS.
 * `editHref` shows an Edit button in the topbar (app preview only).
 */
export function PlaybookShell({
  playbook,
  activePageId,
  onNavigate,
  editHref,
  topbarTag = "Playbook",
}: {
  playbook: Playbook;
  activePageId?: string;
  onNavigate?: (pageId: string) => void;
  editHref?: string;
  topbarTag?: string;
}) {
  const { meta, nav, pages } = playbook;
  const firstId = nav[0]?.pageIds[0] ?? pages[0]?.id;
  const active = activePageId ?? firstId;

  const pageById = new Map(pages.map((p) => [p.id, p]));

  return (
    <div className="pb-root" style={themeToCssVars(playbook.theme) as React.CSSProperties}>
      <div className="pb-layout">
        <nav className="pb-sidebar" aria-label="Playbook navigation">
          <div className="pb-sidebar-head">
            <LogoMark />
            <span className="pb-sidebar-title">
              Pyyne <span>/ {meta.title}</span>
            </span>
          </div>
          <div className="pb-sidebar-nav">
            {nav.map((group) => (
              <div className="pb-sidebar-section" key={group.group}>
                <p className="pb-sidebar-label">{group.group}</p>
                {group.pageIds.map((pid) => {
                  const page = pageById.get(pid);
                  if (!page) return null;
                  return (
                    <a
                      key={pid}
                      className={`pb-nav-item${pid === active ? " active" : ""}`}
                      data-section={pid}
                      href={`#${pid}`}
                      onClick={
                        onNavigate
                          ? (e) => {
                              e.preventDefault();
                              onNavigate(pid);
                            }
                          : undefined
                      }
                    >
                      <span className="pb-nav-icon">
                        <Icon name={page.icon} size={18} />
                      </span>
                      {page.label}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="pb-sidebar-foot">
            <span className="pb-topbar-version">{meta.version}</span>
          </div>
        </nav>

        <div className="pb-body">
          <header className="pb-topbar">
            <div className="pb-topbar-brand">
              <button className="pb-sidebar-toggle" aria-label="Toggle navigation" data-pb-toggle>
                <Icon name="menu" size={20} />
              </button>
              <span className="pb-topbar-tag">{topbarTag}</span>
              <span className="pb-topbar-version">{meta.version}</span>
            </div>
            <div className="pb-topbar-actions">
              {editHref ? (
                <a className="pb-topbar-edit" href={editHref}>
                  <Icon name="edit" size={16} />
                  Edit
                </a>
              ) : null}
            </div>
          </header>

          <main className="pb-main">
            <div>
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`pb-section-page${page.id === active ? " visible" : ""}`}
                  id={`page-${page.id}`}
                >
                  <PageContent page={page} />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
