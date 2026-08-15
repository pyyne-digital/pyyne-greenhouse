import { diffWords, type Change } from "diff";
import type { Block, Page, Playbook } from "./types";

/* ── Text diff ─────────────────────────────────────── */

export type TextDiffPart = { value: string; kind: "same" | "added" | "removed" };

export function diffText(before: string, after: string): TextDiffPart[] {
  const parts: Change[] = diffWords(before ?? "", after ?? "");
  return parts.map((p) => ({
    value: p.value,
    kind: p.added ? "added" : p.removed ? "removed" : "same",
  }));
}

/* ── Structural diff ───────────────────────────────── */

export type FieldChange = {
  path: string;
  before: string;
  after: string;
  textDiff: TextDiffPart[];
};

export type BlockChange =
  | { kind: "added"; block: Block }
  | { kind: "removed"; block: Block }
  | { kind: "changed"; blockId: string; blockType: Block["type"]; fields: FieldChange[] }
  | { kind: "moved"; blockId: string; blockType: Block["type"]; from: number; to: number };

export type PageChange =
  | { kind: "added"; page: Page }
  | { kind: "removed"; page: Page }
  | {
      kind: "changed";
      pageId: string;
      label: string;
      fieldChanges: FieldChange[];
      blockChanges: BlockChange[];
    }
  | { kind: "unchanged"; pageId: string; label: string };

export type PlaybookDiff = {
  metaChanges: FieldChange[];
  themeChanges: FieldChange[];
  navChanged: boolean;
  pageChanges: PageChange[];
  changed: boolean;
};

const PAGE_SCALAR_FIELDS = ["label", "icon", "eyebrow", "title", "subtitle"] as const;

function flattenObject(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== "object") {
    out[prefix] = String(obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") Object.assign(out, flattenObject(v, path));
    else out[path] = String(v ?? "");
  }
  return out;
}

function diffFlat(before: Record<string, string>, after: Record<string, string>): FieldChange[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes: FieldChange[] = [];
  for (const k of keys) {
    const b = before[k] ?? "";
    const a = after[k] ?? "";
    if (b !== a) changes.push({ path: k, before: b, after: a, textDiff: diffText(b, a) });
  }
  return changes;
}

function diffBlocks(before: Block[], after: Block[]): BlockChange[] {
  const changes: BlockChange[] = [];
  const beforeMap = new Map(before.map((b, i) => [b.id, { b, i }]));
  const afterMap = new Map(after.map((b, i) => [b.id, { b, i }]));

  for (const [id, { b, i }] of beforeMap) {
    if (!afterMap.has(id)) changes.push({ kind: "removed", block: b });
    else {
      const { b: a, i: j } = afterMap.get(id)!;
      if (JSON.stringify(b) !== JSON.stringify(a)) {
        changes.push({
          kind: "changed",
          blockId: id,
          blockType: a.type,
          fields: diffFlat(
            flattenObject(b.props, "props"),
            flattenObject(a.props, "props")
          ),
        });
      }
      if (i !== j && changes.every((c) => !(c.kind === "moved" && c.blockId === id))) {
        changes.push({ kind: "moved", blockId: id, blockType: a.type, from: i, to: j });
      }
    }
  }
  for (const [id, { b }] of afterMap) {
    if (!beforeMap.has(id)) changes.push({ kind: "added", block: b });
  }
  return changes;
}

export function diffPlaybooks(before: Playbook | null, after: Playbook): PlaybookDiff {
  if (!before) {
    return {
      metaChanges: [],
      themeChanges: [],
      navChanged: false,
      pageChanges: after.pages.map((p) => ({ kind: "added" as const, page: p })),
      changed: true,
    };
  }

  const metaChanges = diffFlat(
    flattenObject(before.meta, "meta"),
    flattenObject(after.meta, "meta")
  );
  const themeChanges = diffFlat(
    flattenObject(before.theme, "theme"),
    flattenObject(after.theme, "theme")
  );
  const navChanged = JSON.stringify(before.nav) !== JSON.stringify(after.nav);

  const pageChanges: PageChange[] = [];
  const beforePages = new Map(before.pages.map((p) => [p.id, p]));
  const afterPages = new Map(after.pages.map((p) => [p.id, p]));

  for (const [id, b] of beforePages) {
    if (!afterPages.has(id)) pageChanges.push({ kind: "removed", page: b });
  }
  for (const [id, a] of afterPages) {
    const b = beforePages.get(id);
    if (!b) {
      pageChanges.push({ kind: "added", page: a });
      continue;
    }
    const fieldChanges: FieldChange[] = [];
    for (const f of PAGE_SCALAR_FIELDS) {
      if (b[f] !== a[f]) {
        fieldChanges.push({ path: f, before: b[f], after: a[f], textDiff: diffText(b[f], a[f]) });
      }
    }
    const blockChanges = diffBlocks(b.blocks, a.blocks);
    if (fieldChanges.length || blockChanges.length) {
      pageChanges.push({ kind: "changed", pageId: id, label: a.label, fieldChanges, blockChanges });
    } else {
      pageChanges.push({ kind: "unchanged", pageId: id, label: a.label });
    }
  }

  const changed =
    metaChanges.length > 0 ||
    themeChanges.length > 0 ||
    navChanged ||
    pageChanges.some((p) => p.kind !== "unchanged");

  return { metaChanges, themeChanges, navChanged, pageChanges, changed };
}
