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

/**
 * Indices (into `values`) of a longest strictly increasing subsequence.
 * Used to tell real moves apart from index shifts caused by inserts/removals:
 * blocks inside the LIS kept their relative order, blocks outside it moved.
 */
function longestIncreasingRun(values: number[]): Set<number> {
  const n = values.length;
  const inLis = new Set<number>();
  if (n === 0) return inLis;
  const len = new Array<number>(n).fill(1);
  const prev = new Array<number>(n).fill(-1);
  let best = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (values[j] < values[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
    if (len[i] > len[best]) best = i;
  }
  for (let k = best; k !== -1; k = prev[k]) inLis.add(k);
  return inLis;
}

function diffBlocks(before: Block[], after: Block[]): BlockChange[] {
  const changes: BlockChange[] = [];
  const beforeMap = new Map(before.map((b, i) => [b.id, { b, i }]));
  const afterMap = new Map(after.map((b, i) => [b.id, { b, i }]));

  for (const [id, { b }] of beforeMap) {
    if (!afterMap.has(id)) {
      changes.push({ kind: "removed", block: b });
      continue;
    }
    const { b: a } = afterMap.get(id)!;
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push({
        kind: "changed",
        blockId: id,
        blockType: a.type,
        fields: diffFlat(flattenObject(b.props, "props"), flattenObject(a.props, "props")),
      });
    }
  }
  for (const [id, { b }] of afterMap) {
    if (!beforeMap.has(id)) changes.push({ kind: "added", block: b });
  }

  // Moves: blocks present on both sides whose RELATIVE order changed.
  // Take shared blocks in "after" order, map to their "before" indices;
  // the longest increasing run kept its order — everything outside moved.
  const sharedInAfterOrder = after.filter((b) => beforeMap.has(b.id));
  const beforeIdxSeq = sharedInAfterOrder.map((b) => beforeMap.get(b.id)!.i);
  const stable = longestIncreasingRun(beforeIdxSeq);
  sharedInAfterOrder.forEach((b, k) => {
    if (!stable.has(k)) {
      changes.push({
        kind: "moved",
        blockId: b.id,
        blockType: b.type,
        from: beforeMap.get(b.id)!.i,
        to: afterMap.get(b.id)!.i,
      });
    }
  });

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
