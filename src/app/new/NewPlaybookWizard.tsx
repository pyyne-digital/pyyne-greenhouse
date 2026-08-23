"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PyyneLogo } from "@/components/brand/PyyneLogo";
import { PhIcon } from "@/components/Icon";
import { standalone as st } from "@/styles/standalone";
import { ui } from "@/styles/ui";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewPlaybookWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(searchParams.get("description") ?? "");
  const [tags, setTags] = useState("");

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const valid = title.trim().length >= 3 && effectiveSlug.length >= 2 && description.trim().length >= 10;

  function plant() {
    const params = new URLSearchParams({
      title: title.trim(),
      slug: effectiveSlug,
      description: description.trim(),
      tags,
    });
    router.push(`/new/editor?${params.toString()}`);
  }

  return (
    <div className={st.page}>
      <div className={st.column}>
        <div className={st.brandBlock}>
          <PyyneLogo className="w-16 h-16 mx-auto mb-6" />
          <h1 className={st.brandTitle}>Cultivate ideas and routines into a standard process</h1>
          <p className={st.brandSub}>Bring structure to the Pyyne collective intelligence.</p>
        </div>

        <div className={st.formCard}>
          <div className={st.field}>
            <label className={ui.inputLabel}>Playbook Title</label>
            <input
              type="text"
              placeholder="e.g. Consultants Playbook"
              className={st.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={st.field}>
            <label className={ui.inputLabel}>Slug</label>
            <div className={st.slugRow}>
              <span className={st.slugPrefix}>pyyne.com/</span>
              <input
                type="text"
                placeholder="consultants-playbook"
                className={st.slugInput}
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
          </div>

          <div className={st.field}>
            <label className={ui.inputLabel}>Initial Scope</label>
            <textarea
              rows={3}
              placeholder="What does this document instrument? What is in/out of scope?"
              className={`${ui.input} resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={st.field}>
            <label className={ui.inputLabel}>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g.: Engineering, Onboarding"
              className={ui.input}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className={st.actionRow}>
            <button type="button" className={ui.btnPrimaryLarge} disabled={!valid} onClick={plant}>
              Plant Playbook
              <PhIcon name="arrow-right" className="font-bold" />
            </button>
            <Link href="/" className={st.cancelBtn}>
              Cancel
            </Link>
          </div>
        </div>

        <p className={st.footnote}>
          <PhIcon name="shield-check" className="text-base" /> Pyyne Internal Governance Standard
        </p>
      </div>
    </div>
  );
}
