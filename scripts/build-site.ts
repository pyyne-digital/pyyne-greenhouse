/**
 * Static site generator: content/playbooks/*.json → out/ (GitHub Pages).
 *
 * Output:
 *   out/index.html            — lista de playbooks
 *   out/<slug>/index.html     — playbook completo (navegação por hash)
 *   out/assets/*              — css + logo
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync } from "fs";
import { join } from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PlaybookSchema, type Playbook } from "../shared/playbook";
import { PlaybookShell } from "../shared/playbook/PlaybookShell";
import { themeToCssText } from "../shared/playbook";

const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content/playbooks");
const OUT_DIR = join(ROOT, "out");
const BASE_PATH = process.env.PAGES_BASE_PATH ?? "";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap";

const NAV_SCRIPT = `
(function () {
  function show(id) {
    document.querySelectorAll('.pb-section-page').forEach(function (el) {
      el.classList.toggle('visible', el.id === 'page-' + id);
    });
    document.querySelectorAll('.pb-nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-section') === id);
    });
    document.querySelector('.pb-sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.pb-nav-item');
    if (a) { e.preventDefault(); history.replaceState(null, '', '#' + a.getAttribute('data-section')); show(a.getAttribute('data-section')); return; }
    if (e.target.closest('[data-pb-toggle]')) { document.querySelector('.pb-sidebar').classList.toggle('open'); }
  });
  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById('page-' + hash)) show(hash);
})();
`;

function htmlDocument(title: string, body: string, extraHead = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${FONTS_URL}" rel="stylesheet" />
  <link rel="stylesheet" href="${BASE_PATH}/assets/playbook.css" />
  ${extraHead}
</head>
<body>
${body}
<script>${NAV_SCRIPT}</script>
</body>
</html>
`;
}

function loadPlaybooks(): Playbook[] {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => PlaybookSchema.parse(JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf8"))))
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

function renderPlaybookPage(p: Playbook): string {
  const markup = renderToStaticMarkup(
    React.createElement(PlaybookShell, {
      playbook: p,
      logoSrc: `${BASE_PATH}/assets/pyyne-logo.svg`,
    })
  );
  const html = htmlDocument(`Pyyne · ${p.meta.title}`, markup);
  // Playbook root must carry the data-section pages visibility styles per theme
  return html.replace("</head>", `  <style>${""}</style>\n</head>`);
}

function renderIndex(playbooks: Playbook[]): string {
  const cards = playbooks
    .map(
      (p) => `
      <a class="gh-card" href="${BASE_PATH}/${p.meta.slug}/">
        <div class="gh-card-top">
          <span class="gh-favicon">${p.meta.favicon}</span>
          <span class="gh-version">${p.meta.version}</span>
        </div>
        <h2>${p.meta.title}</h2>
        <p>${p.meta.description}</p>
        <div class="gh-tags">${p.meta.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <p class="gh-updated">Atualizado em ${p.meta.lastUpdated}</p>
      </a>`
    )
    .join("");

  const body = `
  <div class="gh-home">
    <header class="gh-header">
      <div class="gh-brand">
        <img src="${BASE_PATH}/assets/pyyne-logo.svg" alt="Pyyne" width="20" height="22" />
        <span>Pyyne <em>/ Playbooks</em></span>
      </div>
    </header>
    <main class="gh-main">
      <p class="gh-eyebrow">Pyyne Digital</p>
      <h1>Playbooks</h1>
      <p class="gh-sub">Guias vivos de como trabalhamos. Criados e mantidos pelo time no Greenhouse.</p>
      <div class="gh-grid">${cards}</div>
    </main>
  </div>`;

  const css = `
  <style>
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #f8f7f4; color: #111110; margin: 0; }
    .gh-header { background: #fff; border-bottom: 1px solid rgba(0,0,0,.08); padding: 0 24px; height: 56px; display: flex; align-items: center; }
    .gh-brand { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; }
    .gh-brand img { display: block; background: #111; border-radius: 6px; padding: 5px; box-sizing: content-box; width: 16px; height: 18px; }
    .gh-brand em { color: #6b6b68; font-style: normal; font-weight: 400; }
    .gh-main { max-width: 960px; margin: 0 auto; padding: 64px 24px; }
    .gh-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #679747; margin-bottom: 8px; }
    .gh-main h1 { font-family: 'DM Serif Display', Georgia, serif; font-size: 42px; letter-spacing: -.02em; margin: 0 0 12px; }
    .gh-sub { color: #6b6b68; font-size: 16px; margin: 0 0 40px; max-width: 560px; line-height: 1.65; }
    .gh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .gh-card { display: block; background: #fff; border: 1px solid rgba(0,0,0,.08); border-top: 3px solid #C4D7B6; border-radius: 16px; padding: 24px; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: box-shadow .15s, transform .15s; }
    .gh-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.07); text-decoration: none; transform: translateY(-1px); }
    .gh-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .gh-favicon { font-size: 22px; }
    .gh-version { font-size: 11px; color: #9a9a96; border: 1px solid rgba(0,0,0,.08); padding: 3px 9px; border-radius: 20px; }
    .gh-card h2 { font-size: 17px; font-weight: 600; margin: 0 0 8px; color: #111110; }
    .gh-card p { font-size: 13.5px; color: #6b6b68; line-height: 1.6; margin: 0 0 14px; }
    .gh-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .gh-tags span { font-size: 11px; font-weight: 500; background: #eef4e8; color: #4a6e32; border: 1px solid #C4D7B6; padding: 2px 9px; border-radius: 20px; }
    .gh-updated { font-size: 12px !important; color: #9a9a96 !important; margin: 0 !important; }
  </style>`;

  return htmlDocument("Pyyne · Playbooks", body, css).replace(`<link rel="stylesheet" href="${BASE_PATH}/assets/playbook.css" />`, "");
}

function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(join(OUT_DIR, "assets"), { recursive: true });

  const css = readFileSync(join(ROOT, "shared/playbook/playbook.css"), "utf8");
  writeFileSync(join(OUT_DIR, "assets/playbook.css"), css);
  copyFileSync(join(ROOT, "public/assets/pyyne-logo.svg"), join(OUT_DIR, "assets/pyyne-logo.svg"));

  const playbooks = loadPlaybooks();

  for (const p of playbooks) {
    const dir = join(OUT_DIR, p.meta.slug);
    mkdirSync(dir, { recursive: true });
    const themeCss = themeToCssText(p.theme);
    writeFileSync(
      join(dir, "index.html"),
      renderPlaybookPage(p).replace(
        "</head>",
        `  <style>\n${themeCss}\n  </style>\n</head>`
      )
    );
    console.log(`built /${p.meta.slug}/`);
  }

  writeFileSync(join(OUT_DIR, "index.html"), renderIndex(playbooks));
  console.log(`built index with ${playbooks.length} playbook(s) -> out/`);
}

main();
