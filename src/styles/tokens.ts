/**
 * Design tokens — single source of truth for the Greenhouse UI.
 * Mirror of the @theme block in globals.css; use these when a value
 * is needed in JS (e.g. dynamic inline styles like color swatches).
 */
export const colors = {
  forest: "#4b6332",
  forestDeep: "#3a4d27",
  sage: "#6a8a50",
  leaf: "#a3b18a",
  moss: "#f0f2eb",
  ink: "#1a1a1a",
  muted: "#666666",
  paper: "#fcfcf9",
  border: "#e5e7eb",
  faint: "#f9f9f8",
  diffAdded: "#e6f4ea",
  diffAddedText: "#137333",
  diffRemoved: "#fcebeb",
  diffRemovedText: "#a32d2d",
} as const;

export const fonts = {
  sans: "var(--font-outfit), Outfit, sans-serif",
  serif: "var(--font-newsreader), Newsreader, serif",
  mono: "var(--font-jetbrains), JetBrains Mono, monospace",
} as const;
