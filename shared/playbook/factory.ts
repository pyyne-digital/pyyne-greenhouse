import type { Block, BlockType, Page, Playbook } from "./types";
import { defaultTheme } from "./theme";

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* Human labels + descriptions for the editor palette */
export const BLOCK_LABELS: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Green cover banner with title and tags" },
  card: { label: "Card", hint: "Card with icon, title and list/text" },
  cardGrid: { label: "Card grid", hint: "Cards side by side in a grid" },
  alert: { label: "Alert", hint: "Notice banner (info/success/warning)" },
  checklist: { label: "Checklist", hint: "List with checkboxes" },
  timeline: { label: "Timeline", hint: "Steps on a timeline with badges" },
  pillRow: { label: "Pills", hint: "Row of colored tags" },
  contributors: { label: "Contributions", hint: "Learning cards with author" },
  table: { label: "Table", hint: "Table with configurable columns" },
  letterCards: { label: "Letter cards", hint: "Big letters (e.g. STAR)" },
  qaList: { label: "Questions & whys", hint: "Question list with what each reveals" },
  formatCards: { label: "Format cards", hint: "Cards with colored dot and note" },
  changelog: { label: "Changelog", hint: "Version entries with changes" },
  subHeading: { label: "Section subheading", hint: "Small uppercase label" },
  separator: { label: "Separator", hint: "Divider line" },
  richText: { label: "Text", hint: "Free text paragraph" },
  image: { label: "Image", hint: "Image with optional caption" },
  quote: { label: "Quote", hint: "Highlighted quote with author" },
  ctaButton: { label: "Action button", hint: "Prominent button/link" },
};

export function createBlock(type: BlockType): Block {
  const id = newId("b");
  switch (type) {
    case "hero":
      return {
        id,
        type,
        props: { eyebrow: "Eyebrow", title: "Highlight title", body: "Supporting text.", metaTags: [] },
      };
    case "card":
      return { id, type, props: { icon: "book", iconColor: "teal", title: "New card", items: ["Item"] } };
    case "cardGrid":
      return {
        id,
        type,
        props: {
          columns: 2,
          cards: [
            { icon: "book", iconColor: "teal", title: "Card A", items: ["Item"] },
            { icon: "target", iconColor: "blue", title: "Card B", items: ["Item"] },
          ],
        },
      };
    case "alert":
      return { id, type, props: { variant: "info", icon: "info", body: "Alert message." } };
    case "checklist":
      return { id, type, props: { title: "Checklist", icon: "clipboard-check", items: ["Item"] } };
    case "timeline":
      return {
        id,
        type,
        props: {
          title: "Timeline",
          icon: "clock",
          items: [{ label: "Step", badgeText: "~10 min", badgeColor: "gray", body: "Description." }],
        },
      };
    case "pillRow":
      return { id, type, props: { items: [{ text: "Pill", color: "teal" }] } };
    case "contributors":
      return {
        id,
        type,
        props: { label: "Keep doing", variant: "keep", entries: [{ author: "Name", text: "Learning." }] },
      };
    case "table":
      return {
        id,
        type,
        props: { columns: ["Column 1", "Column 2"], rows: [["Value", "Value"]] },
      };
    case "letterCards":
      return {
        id,
        type,
        props: { items: [{ letter: "S", word: "Situation", question: "", look: "" }] },
      };
    case "qaList":
      return {
        id,
        type,
        props: { title: "Example questions", items: [{ q: "Question?", why: "What it reveals." }] },
      };
    case "formatCards":
      return {
        id,
        type,
        props: {
          label: "Formats",
          items: [{ dotColor: "#679747", title: "Format", desc: "Description.", note: "Note." }],
        },
      };
    case "changelog":
      return {
        id,
        type,
        props: {
          entries: [
            { version: "v1.0", date: "Today", badgeColor: "teal", typeLabel: "Release", changes: ["Change"] },
          ],
        },
      };
    case "subHeading":
      return { id, type, props: { text: "Subheading" } };
    case "separator":
      return { id, type, props: {} };
    case "richText":
      return { id, type, props: { body: "Write here." } };
    case "image":
      return { id, type, props: { src: "https://placehold.co/720x360", alt: "Image", caption: "" } };
    case "quote":
      return { id, type, props: { text: "Quote.", author: "" } };
    case "ctaButton":
      return { id, type, props: { label: "Learn more", href: "https://", variant: "primary" } };
  }
}

export function createPage(n: number): Page {
  return {
    id: newId("pagina"),
    label: `New page ${n}`,
    icon: "book",
    eyebrow: "Pyyne Digital",
    title: `New page ${n}`,
    subtitle: "Page description.",
    blocks: [],
  };
}

export function createPlaybook(input: {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}): Playbook {
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return {
    schemaVersion: 1,
    meta: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      version: "v0.1",
      lastUpdated: today,
      tags: input.tags,
      favicon: "🌱",
    },
    theme: defaultTheme,
    nav: [{ group: "Getting Started", pageIds: ["overview"] }],
    pages: [
      {
        id: "overview",
        label: "Overview",
        icon: "book",
        eyebrow: "Pyyne Digital",
        title: input.title,
        subtitle: input.description,
        blocks: [
          {
            id: newId("b"),
            type: "hero",
            props: {
              eyebrow: "Playbook",
              title: input.title,
              body: input.description,
              metaTags: input.tags,
            },
          },
        ],
      },
    ],
  };
}
