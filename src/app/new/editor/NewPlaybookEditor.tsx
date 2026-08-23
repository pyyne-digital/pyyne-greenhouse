"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createPlaybook } from "@playbook/index";
import { EditorClient } from "../../playbooks/[slug]/edit/EditorClient";

export function NewPlaybookEditor({ author }: { author: string }) {
  const searchParams = useSearchParams();

  const playbook = useMemo(() => {
    const title = searchParams.get("title")?.trim() || "Untitled Playbook";
    const slug = searchParams.get("slug")?.trim() || "untitled";
    const description = searchParams.get("description")?.trim() || "A new Pyyne playbook.";
    const tags = (searchParams.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    return createPlaybook({ slug, title, description, tags });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EditorClient playbook={playbook} author={author} mode="create" />;
}
