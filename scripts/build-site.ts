/**
 * Static site generator: content/playbooks/*.json → out/ (GitHub Pages).
 *
 * Output:
 *   out/index.html            — playbook list
 *   out/<slug>/index.html     — full playbook (hash navigation)
 *   out/assets/*              — css + logo
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync } from "fs";
import { dirname, join } from "path";
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
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=JetBrains+Mono:wght@400;500&display=swap";

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
    var main = document.querySelector('.pb-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' }); else window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const markup = renderToStaticMarkup(React.createElement(PlaybookShell, { playbook: p }));
  return htmlDocument(`Pyyne · ${p.meta.title}`, markup);
}

function renderIndex(playbooks: Playbook[]): string {
  const cards = playbooks
    .map(
      (p) => `
      <a class="gh-card" href="${BASE_PATH}/${p.meta.slug}/">
        <div class="gh-card-hero"><h2>${p.meta.title}</h2></div>
        <div class="gh-card-body">
          <div class="gh-card-top">
            <span class="gh-favicon">${p.meta.favicon}</span>
            <span class="gh-version">${p.meta.version}</span>
          </div>
          <p>${p.meta.description}</p>
          <div class="gh-tags">${p.meta.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <p class="gh-updated">Updated ${p.meta.lastUpdated}</p>
        </div>
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
      <p class="gh-sub">Living guides on how we work. Created and maintained by the team in Greenhouse.</p>
      <div class="gh-grid">${cards}</div>
    </main>
  </div>`;

  const css = `
  <style>
    body { font-family: 'Outfit', system-ui, sans-serif; background: #fcfcf9; color: #1a1a1a; margin: 0; }
    .gh-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 24px; height: 56px; display: flex; align-items: center; }
    .gh-brand { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; }
    .gh-brand img { display: block; border-radius: 6px; width: 20px; height: 20px; }
    .gh-brand em { color: #666666; font-style: normal; font-weight: 400; }
    .gh-main { max-width: 960px; margin: 0 auto; padding: 64px 24px; }
    .gh-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #4b6332; margin-bottom: 12px; }
    .gh-main h1 { font-family: 'Newsreader', Georgia, serif; font-size: 48px; font-weight: 700; letter-spacing: -.02em; margin: 0 0 16px; }
    .gh-sub { color: #666666; font-size: 18px; margin: 0 0 48px; max-width: 560px; line-height: 1.65; font-weight: 300; }
    .gh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .gh-card { display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit; box-shadow: 0 1px 3px rgba(0,0,0,.05); transition: box-shadow .15s, transform .15s; }
    .gh-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); text-decoration: none; transform: translateY(-2px); }
    .gh-card-hero { height: 120px; background: linear-gradient(135deg, #4b6332 0%, #3a4d27 100%); padding: 24px; display: flex; flex-direction: column; justify-content: flex-end; }
    .gh-card-hero h2 { font-family: 'Newsreader', Georgia, serif; font-size: 22px; font-weight: 700; color: #fff; margin: 0; }
    .gh-card-body { padding: 24px; }
    .gh-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .gh-favicon { font-size: 20px; }
    .gh-version { font-size: 10px; font-weight: 700; color: #666666; border: 1px solid #e5e7eb; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: .08em; }
    .gh-card p { font-size: 13.5px; color: #666666; line-height: 1.6; margin: 0 0 14px; }
    .gh-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .gh-tags span { font-size: 10px; font-weight: 700; background: #f0f2eb; color: #4b6332; padding: 3px 9px; border-radius: 6px; text-transform: uppercase; letter-spacing: .08em; }
    .gh-updated { font-size: 12px !important; color: #9a9a96 !important; margin: 0 !important; }
  </style>`;

  return htmlDocument("Pyyne · Playbooks", body, css).replace(`<link rel="stylesheet" href="${BASE_PATH}/assets/playbook.css" />`, "");
}

/** Inline CSS @import statements recursively (the playbook.css bundle index). */
function bundleCss(entryPath: string): string {
  const src = readFileSync(entryPath, "utf8");
  return src.replace(/@import\s+["']\.\/(.+?)["'];?/g, (_m, rel) =>
    bundleCss(join(dirname(entryPath), rel))
  );
}

function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(join(OUT_DIR, "assets"), { recursive: true });

  const css = bundleCss(join(ROOT, "shared/playbook/playbook.css"));
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
