/**
 * One-shot migration: interviewer-playbook content/config.js →
 * content/playbooks/interviewer.json (greenhouse schema v1).
 *
 * Usage: npm run migrate:interviewer -- [path-to-old-repo]
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { PlaybookSchema, type Block, type Page, type Playbook } from "../shared/playbook";
import { defaultTheme } from "../shared/playbook";

const OLD_REPO = resolve(process.argv[2] ?? join(__dirname, "../../interviewer-playbook"));
const OUT_FILE = join(__dirname, "../content/playbooks/interviewer.json");

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cfg = any;

function loadConfig(): Cfg {
  const src = readFileSync(join(OLD_REPO, "content/config.js"), "utf8");
  const fn = new Function(`${src}; return PLAYBOOK_CONFIG;`);
  return fn();
}

let seq = 0;
const bid = (p: string) => `${p}-${(++seq).toString().padStart(3, "0")}`;

function mapNav(nav: Cfg): { group: string; pageIds: string[] }[] {
  return nav.map((g: Cfg) => ({ group: g.label, pageIds: g.items.map((i: Cfg) => i.id) }));
}

function overviewPage(s: Cfg): Page {
  return {
    id: "overview",
    label: "Overview",
    icon: "book",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("overview"),
        type: "hero",
        props: { eyebrow: s.hero.eyebrow, title: s.hero.title, body: s.hero.body, metaTags: s.meta },
      },
      {
        id: bid("overview"),
        type: "cardGrid",
        props: {
          columns: 2,
          cards: s.overviewCards.map((c: Cfg) => ({
            icon: c.iconSvg,
            iconColor: c.iconClass.replace("icon-", ""),
            title: c.title,
            items: c.items,
          })),
        },
      },
      {
        id: bid("overview"),
        type: "timeline",
        props: {
          title: "Interview flow at a glance",
          icon: "clock",
          items: s.timeline.map((t: Cfg) => ({
            label: t.label,
            badgeText: t.badge.text,
            badgeColor: t.badge.cls.replace("badge-", ""),
            body: t.body,
          })),
        },
      },
    ],
  };
}

function purposePage(s: Cfg): Page {
  return {
    id: "purpose",
    label: "Purpose & Scope",
    icon: "target",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("purpose"),
        type: "alert",
        props: { variant: s.alert.type.replace("alert-", ""), icon: s.alert.icon, body: s.alert.body },
      },
      {
        id: bid("purpose"),
        type: "cardGrid",
        props: {
          columns: 2,
          cards: s.blocks.map((b: Cfg) => ({
            icon: b.iconSvg,
            iconColor: b.iconClass.replace("icon-", ""),
            title: b.title,
            items: b.items,
          })),
        },
      },
    ],
  };
}

function beforePage(s: Cfg): Page {
  return {
    id: "before",
    label: "Before",
    icon: "clock",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("before"),
        type: "checklist",
        props: { title: "Pre-interview checklist", icon: "clipboard-check", items: s.checklist },
      },
      {
        id: bid("before"),
        type: "card",
        props: {
          icon: "book",
          iconColor: "blue",
          title: s.challengeNote.title,
          body: s.challengeNote.body,
        },
      },
      {
        id: bid("before"),
        type: "formatCards",
        props: {
          label: "Interview formats",
          items: s.formats.map((f: Cfg) => ({
            dotColor: f.dot,
            title: f.title,
            desc: f.desc,
            note: f.note,
          })),
        },
      },
      {
        id: bid("before"),
        type: "card",
        props: {
          icon: "target",
          iconColor: "amber",
          title: s.roleNote.title,
          items: s.roleNote.items,
        },
      },
    ],
  };
}

function duringPage(s: Cfg): Page {
  return {
    id: "during",
    label: "During",
    icon: "microphone",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("during"),
        type: "card",
        props: {
          icon: "target",
          iconColor: "teal",
          title: s.coreCard.title,
          body: s.coreCard.intro,
          highlight: true,
          items: s.coreCard.signals.map((sig: Cfg) => `<strong>${sig.label}:</strong> ${sig.desc}`),
        },
      },
      {
        id: bid("during"),
        type: "card",
        props: { icon: "microphone", iconColor: "teal", title: s.openingCard.title, items: s.openingCard.items },
      },
      {
        id: bid("during"),
        type: "card",
        props: { icon: "users", iconColor: "blue", title: s.conversationCard.title, items: s.conversationCard.items },
      },
      {
        id: bid("during"),
        type: "cardGrid",
        props: {
          columns: 2,
          cards: [
            {
              icon: "bulb",
              iconColor: "amber",
              title: s.stuckCard.title,
              body: s.stuckCard.body,
              items: s.stuckCard.items,
            },
            {
              icon: "clipboard-check",
              iconColor: "purple",
              title: s.notesCard.title,
              body: s.notesCard.body,
            },
          ],
        },
      },
      {
        id: bid("during"),
        type: "pillRow",
        props: { items: s.notesCard.pills.map((p: string) => ({ text: p, color: "teal" })) },
      },
    ],
  };
}

function afterPage(s: Cfg): Page {
  return {
    id: "after",
    label: "After",
    icon: "clipboard-check",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("after"),
        type: "alert",
        props: { variant: s.alert.type.replace("alert-", ""), icon: s.alert.icon, body: s.alert.body },
      },
      {
        id: bid("after"),
        type: "cardGrid",
        props: {
          columns: 2,
          cards: [
            { icon: "users", iconColor: "blue", title: s.debriefCard.title, items: s.debriefCard.items },
            {
              icon: "clipboard-check",
              iconColor: "teal",
              title: s.feedbackCard.title,
              items: s.feedbackCard.items,
            },
          ],
        },
      },
    ],
  };
}

function aiToolsPage(s: Cfg): Page {
  return {
    id: "ai-tools",
    label: "AI & Tools",
    icon: "robot",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("aitools"),
        type: "alert",
        props: { variant: s.alert.type.replace("alert-", ""), icon: s.alert.icon, body: s.alert.body },
      },
      {
        id: bid("aitools"),
        type: "card",
        props: { icon: "robot", iconColor: "blue", title: s.aiAllowedCard.title, items: s.aiAllowedCard.items },
      },
      {
        id: bid("aitools"),
        type: "cardGrid",
        props: {
          columns: 2,
          cards: s.tools.map((t: Cfg) => ({
            icon: t.iconSvg,
            iconColor: t.iconClass.replace("icon-", ""),
            title: t.title,
            body: t.body,
          })),
        },
      },
      {
        id: bid("aitools"),
        type: "card",
        props: {
          icon: "chart-bar",
          iconColor: "teal",
          title: s.dataRolesCard.title,
          body: s.dataRolesCard.body,
          items: s.dataRolesCard.items,
        },
      },
    ],
  };
}

function evaluationPage(s: Cfg): Page {
  return {
    id: "evaluation",
    label: "Evaluation Matrix",
    icon: "chart-bar",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("eval"),
        type: "table",
        props: {
          columns: ["Dimension", "What to assess", "Quality signal"],
          rows: s.table.map((r: Cfg) => [r.dim, r.what, r.signal]),
        },
      },
      {
        id: bid("eval"),
        type: "alert",
        props: { variant: "info", icon: "info", body: s.scoringNote },
      },
    ],
  };
}

function starPage(s: Cfg): Page {
  return {
    id: "star",
    label: "STAR Framework",
    icon: "bulb",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      { id: bid("star"), type: "richText", props: { body: s.intro } },
      {
        id: bid("star"),
        type: "letterCards",
        props: {
          items: s.dimensions.map((d: Cfg) => ({
            letter: d.letter,
            word: d.word,
            question: d.question,
            look: d.look,
          })),
        },
      },
      { id: bid("star"), type: "separator", props: {} },
      {
        id: bid("star"),
        type: "qaList",
        props: {
          title: "Example questions",
          items: s.examples.map((e: Cfg) => ({ q: e.q, why: e.why })),
        },
      },
      {
        id: bid("star"),
        type: "alert",
        props: { variant: "success", icon: "bulb", body: s.usageNote },
      },
    ],
  };
}

function learningsPage(s: Cfg): Page {
  return {
    id: "learnings",
    label: "Team Learnings",
    icon: "users",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("learn"),
        type: "contributors",
        props: { label: s.keepDoingLabel, variant: "keep", entries: s.keepDoing },
      },
      { id: bid("learn"), type: "separator", props: {} },
      {
        id: bid("learn"),
        type: "contributors",
        props: { label: s.changeLabel, variant: "change", entries: s.change },
      },
    ],
  };
}

function changelogPage(s: Cfg): Page {
  return {
    id: "changelog",
    label: "Changelog",
    icon: "history",
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    blocks: [
      {
        id: bid("log"),
        type: "changelog",
        props: {
          entries: s.entries.map((e: Cfg) => ({
            version: e.version,
            date: e.date,
            badgeColor: e.type.replace("badge-", ""),
            typeLabel: e.typeLabel,
            changes: e.changes,
          })),
        },
      },
      {
        id: bid("log"),
        type: "alert",
        props: { variant: "info", icon: "info", body: s.contribute },
      },
    ],
  };
}

function main() {
  const cfg = loadConfig();
  const sections: Record<string, Cfg> = cfg.sections;

  const playbook: Playbook = {
    schemaVersion: 1,
    meta: {
      slug: "interviewer",
      title: cfg.meta.title,
      description: cfg.meta.description,
      version: cfg.meta.version,
      lastUpdated: cfg.meta.lastUpdated,
      tags: cfg.meta.tags,
      favicon: cfg.meta.favicon ?? "📋",
    },
    theme: defaultTheme,
    nav: mapNav(cfg.nav),
    pages: [
      overviewPage(sections.overview),
      purposePage(sections.purpose),
      beforePage(sections.before),
      duringPage(sections.during),
      afterPage(sections.after),
      aiToolsPage(sections["ai-tools"]),
      evaluationPage(sections.evaluation),
      starPage(sections.star),
      learningsPage(sections.learnings),
      changelogPage(sections.changelog),
    ],
  };

  const parsed = PlaybookSchema.parse(playbook);
  mkdirSync(join(OUT_FILE, ".."), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(parsed, null, 2) + "\n");
  console.log(`Migrated ${parsed.pages.length} pages -> ${OUT_FILE}`);
}

main();
