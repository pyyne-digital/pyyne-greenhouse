"use client";

import { useState } from "react";
import { PlaybookShell, type Playbook } from "@playbook/index";

export function PreviewClient({ playbook }: { playbook: Playbook }) {
  const [activePage, setActivePage] = useState(playbook.nav[0]?.pageIds[0] ?? playbook.pages[0]?.id);

  return (
    <PlaybookShell
      playbook={playbook}
      activePageId={activePage}
      onNavigate={setActivePage}
      editHref={`/playbooks/${playbook.meta.slug}/edit`}
    />
  );
}
