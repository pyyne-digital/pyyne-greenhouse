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

/**
 * Full playbook layout (topbar + sidebar + pages).
 * `activePageId` / `onNavigate` make it interactive in the web app;
 * the static build renders all pages and toggles visibility with JS.
 */
export function PlaybookShell({
  playbook,
  activePageId,
  onNavigate,
  logoSrc = "assets/pyyne-logo.svg",
  topbarTag = "Playbook",
}: {
  playbook: Playbook;
  activePageId?: string;
  onNavigate?: (pageId: string) => void;
  logoSrc?: string;
  topbarTag?: string;
}) {
  const { meta, nav, pages } = playbook;
  const firstId = nav[0]?.pageIds[0] ?? pages[0]?.id;
  const active = activePageId ?? firstId;

  const pageById = new Map(pages.map((p) => [p.id, p]));

  return (
    <div className="pb-root" style={themeToCssVars(playbook.theme) as React.CSSProperties}>
      <div className="pb-layout">
        <header className="pb-topbar">
          <div className="pb-topbar-brand">
            <button className="pb-sidebar-toggle" aria-label="Toggle navigation" data-pb-toggle>
              <Icon name="menu" size={20} />
            </button>
            <div className="pb-topbar-logo" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Pyyne logo" width={16} height={18} />
            </div>
            <span className="pb-topbar-name">
              Pyyne <span>/ {meta.title}</span>
            </span>
          </div>
          <div className="pb-topbar-actions">
            <span className="pb-topbar-tag">{topbarTag}</span>
            <span className="pb-topbar-version">{meta.version}</span>
          </div>
        </header>

        <nav className="pb-sidebar" aria-label="Playbook navigation">
          <div>
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
        </nav>

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
  );
}
