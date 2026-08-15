"use client";

import { useState } from "react";
import Link from "next/link";
import { PlaybookShell, type Playbook } from "@playbook/index";

export function PreviewClient({ playbook }: { playbook: Playbook }) {
  const [activePage, setActivePage] = useState(playbook.nav[0]?.pageIds[0] ?? playbook.pages[0]?.id);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 200,
          display: "flex",
          gap: 8,
        }}
      >
        <Link href="/" role="button" className="outline" style={{ background: "#fff" }}>
          ← Greenhouse
        </Link>
        <Link href={`/playbooks/${playbook.meta.slug}/edit`} role="button">
          Editar este playbook
        </Link>
      </div>
      <PlaybookShell
        playbook={playbook}
        activePageId={activePage}
        onNavigate={setActivePage}
        logoSrc="/assets/pyyne-logo.svg"
      />
    </div>
  );
}
