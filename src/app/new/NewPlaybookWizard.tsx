"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createPlaybook } from "@playbook/index";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewPlaybookWizard() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string } | { error: string } | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const valid = title.trim().length >= 3 && effectiveSlug.length >= 2 && description.trim().length >= 10 && summary.trim().length >= 4;

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      const playbook = createPlaybook({
        slug: effectiveSlug,
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "create", slug: effectiveSlug, content: playbook, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao submeter");
      setResult({ url: data.url });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Erro desconhecido" });
    } finally {
      setBusy(false);
    }
  }

  if (result && "url" in result) {
    return (
      <article>
        <h3 style={{ fontSize: 18 }}>Playbook submetido 🌱</h3>
        <p>
          Sua proposta de novo playbook aguarda aprovação de um admin. Depois do merge, ele aparece
          na home e ganha um site próprio no GitHub Pages.
        </p>
        <p>
          <a href={result.url} target="_blank" rel="noreferrer">
            Ver pull request no GitHub ↗
          </a>
        </p>
        <footer>
          <Link href="/proposals" role="button">
            Ver propostas
          </Link>
          <Link href="/" role="button" className="secondary">
            Voltar para a home
          </Link>
        </footer>
      </article>
    );
  }

  return (
    <article>
      <label>
        Nome do playbook
        <input
          type="text"
          value={title}
          placeholder="Ex.: Onboarding de Engenharia"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Slug (URL)
        <input
          type="text"
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
        <small>Site público em: pyyne-digital.github.io/pyyne-greenhouse/{effectiveSlug || "…"}/</small>
      </label>
      <label>
        Descrição
        <textarea
          rows={3}
          value={description}
          placeholder="O que este playbook cobre e para quem ele é."
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Tags (separadas por vírgula)
        <input
          type="text"
          value={tags}
          placeholder="Ex.: Engineering, Onboarding"
          onChange={(e) => setTags(e.target.value)}
        />
      </label>
      <label>
        Resumo para os admins
        <textarea
          rows={3}
          value={summary}
          placeholder="Por que este playbook deve existir?"
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      {result && "error" in result ? (
        <p style={{ color: "#A32D2D", fontSize: 13 }}>{result.error}</p>
      ) : null}
      <button type="button" disabled={!valid || busy} onClick={submit} aria-busy={busy}>
        {busy ? "Submetendo…" : "Submeter para aprovação"}
      </button>
    </article>
  );
}
