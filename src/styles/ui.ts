/**
 * Shared UI class constants (Tailwind). Reusable primitives used
 * across multiple screens. Screen-specific classes live in
 * src/styles/<screen>.ts.
 */
export const ui = {
  /* Buttons */
  btnPrimary:
    "inline-flex items-center justify-center gap-2 bg-forest hover:bg-sage text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-forest/10 cursor-pointer",
  btnPrimaryLarge:
    "flex-1 bg-forest hover:bg-sage text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-forest/10 flex items-center justify-center gap-2 cursor-pointer",
  btnGhost:
    "inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-all cursor-pointer",
  btnGhostDanger:
    "w-full py-2.5 bg-gray-50 border border-border rounded-lg text-xs font-bold text-muted uppercase tracking-widest hover:bg-white hover:text-ink transition-all cursor-pointer",
  btnDanger:
    "bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-red-500/10 cursor-pointer",
  btnDark:
    "w-full py-3 bg-ink text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-ink/10 cursor-pointer",
  btnText: "px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-paper rounded-xl transition-all cursor-pointer",

  /* Labels / eyebrows */
  eyebrow: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted",
  eyebrowWide: "text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]",
  eyebrowForest: "text-[10px] font-bold text-forest uppercase tracking-widest",

  /* Chips & badges */
  chipVersion: "text-[10px] font-bold text-muted bg-gray-100 px-2 py-1 rounded tracking-widest uppercase",
  chipPlaybook: "text-[10px] font-bold text-forest bg-moss px-2 py-1 rounded tracking-widest uppercase",
  badgeCount: "bg-forest text-white text-[9px] px-1.5 py-0.5 rounded-full",

  /* Cards */
  card: "bg-white border border-border rounded-2xl shadow-sm",
  cardLarge: "bg-white border border-border rounded-[32px] shadow-sm",

  /* Surfaces */
  pageHeading: "font-serif text-5xl font-bold tracking-tight mb-4",
  pageSubheading: "text-muted text-xl font-light max-w-2xl leading-relaxed",

  /* Forms */
  inputLabel: "block text-[10px] font-bold text-muted uppercase tracking-[0.15em] px-1 mb-2",
  input:
    "w-full px-6 py-4 bg-paper/50 border border-border rounded-xl text-sm focus:border-forest/50 focus:ring-4 focus:ring-forest/5 outline-none transition-all",
  inputMono:
    "w-full px-6 py-4 bg-paper/50 border border-border rounded-xl text-sm font-mono focus:border-forest/50 focus:ring-4 focus:ring-forest/5 outline-none transition-all",

  /* Diff text */
  diffInserted: "bg-diff-added text-diff-added-text no-underline px-0.5 rounded-sm",
  diffDeleted: "bg-diff-removed text-diff-removed-text line-through px-0.5 rounded-sm",

  /* Avatar fallback */
  avatarFallback: "rounded-full bg-moss flex items-center justify-center text-forest",
} as const;

/* Change-type badges used in proposal review / history */
export const changeBadge = {
  base: "text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded",
  modified: "bg-blue-50 text-indigo-700",
  theme: "bg-amber-50 text-amber-700",
  added: "bg-forest text-white",
  removed: "bg-red-50 text-red-600",
  moved: "bg-blue-50 text-blue-600",
  neutral: "bg-gray-100 text-muted",
} as const;
