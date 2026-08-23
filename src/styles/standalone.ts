/** Standalone screens (login, new-playbook wizard) class constants. */
export const standalone = {
  /* Centered layout */
  page: "min-h-screen flex items-center justify-center p-8 bg-paper",
  column: "max-w-xl w-full",
  columnNarrow: "max-w-md w-full",

  /* Brand header */
  brandBlock: "text-center mb-12",
  brandTitle: "font-serif text-4xl font-bold mb-4 tracking-tight",
  brandSub: "text-muted text-lg font-normal leading-relaxed",

  /* Card */
  formCard: "bg-white border border-border rounded-3xl p-10 md:p-14 shadow-sm space-y-8",
  loginCard: "bg-white rounded-[48px] p-16 shadow-2xl shadow-ink/5 border border-border text-center space-y-12",

  /* Fields */
  field: "space-y-2",
  slugRow: "flex items-center",
  slugPrefix: "bg-gray-50 border border-r-0 border-border px-5 py-4 rounded-l-xl text-muted text-xs font-medium",
  slugInput:
    "flex-1 px-6 py-4 bg-paper/50 border border-border rounded-r-xl text-sm font-mono focus:border-forest/50 focus:ring-4 focus:ring-forest/5 outline-none transition-all",
  titleInput:
    "w-full px-6 py-4 bg-paper/50 border border-border rounded-xl text-lg font-serif focus:border-forest/50 focus:ring-4 focus:ring-forest/5 outline-none transition-all",

  /* Actions */
  actionRow: "pt-6 flex items-center gap-4",
  cancelBtn: "px-8 py-4 text-muted hover:text-ink font-semibold transition-colors text-sm cursor-pointer",

  /* Footnotes */
  footnote:
    "mt-12 text-center text-[10px] font-bold text-muted uppercase tracking-widest flex items-center justify-center gap-2",

  /* Login extras */
  loginLogo: "w-20 h-20 mx-auto",
  loginTitle: "font-serif text-4xl tracking-tight text-ink leading-none",
  loginSub: "text-muted text-base font-light",
  loginDivider: "h-px bg-gradient-to-r from-transparent via-border to-transparent",
  loginPitch: "text-neutral-800 text-lg leading-relaxed font-light",
  googleBtn:
    "w-full bg-white border border-border py-4 rounded-2xl flex items-center justify-center gap-4 font-bold text-ink transition-all hover:border-forest hover:bg-paper hover:scale-[1.02] active:scale-100 shadow-sm cursor-pointer",
  loginFooter: "pt-4",
  loginFooterNote: "text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold",
  statusRow: "mt-12 flex items-center justify-center gap-3",
  statusDot: "w-2 h-2 bg-forest rounded-full animate-pulse shadow-lg shadow-forest/50",
  statusText: "text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]",
} as const;
