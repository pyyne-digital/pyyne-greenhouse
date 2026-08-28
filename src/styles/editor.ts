/** Editor + Draft Preview class constants. */
export const editor = {
  layout: "flex h-screen overflow-hidden",

  /* Left sidebar */
  sidebar: "w-64 bg-white border-r border-border flex-shrink-0 hidden lg:flex flex-col h-full",
  sidebarHead: "p-6 border-b border-border flex items-center gap-2",
  sidebarTitle: "font-serif text-lg font-bold tracking-tight",
  sidebarTitleMuted: "text-muted font-normal",
  sidebarScroll: "flex-1 overflow-y-auto py-6",
  sidebarSection: "px-6 mb-8",
  sidebarLabel: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-4 px-3",
  navItem: "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors w-full text-left",
  navItemActive: "bg-moss text-forest font-bold",
  navItemIdle: "text-muted hover:bg-moss/50 hover:text-ink",
  navItemInner: "flex items-center gap-3",
  structureBadgeReady: "text-[9px] font-bold text-forest bg-moss px-1.5 py-0.5 rounded uppercase tracking-wider",
  structureBadgeEmpty: "text-[9px] font-bold text-muted bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider",
  sidebarFoot: "mt-auto pt-6 border-t border-border px-6 pb-6",
  metaRow: "flex items-center gap-2 text-xs text-muted",

  /* Top bar */
  topbar: "h-16 border-b border-border flex items-center justify-between px-8 bg-white shrink-0 z-20",
  topbarLeft: "flex items-center gap-6",
  editingLabel: "text-xs font-bold text-ink",
  editingName: "font-serif italic text-forest",
  topbarDivider: "h-4 w-px bg-border",
  draftBadge:
    "flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100",
  draftDot: "w-1 h-1 rounded-full bg-amber-600 animate-pulse",
  newBadge:
    "flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100",
  topbarActions: "flex items-center gap-4",
  previewBtn: "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted hover:text-ink transition-colors cursor-pointer",

  /* Canvas */
  canvasWrap: "flex-1 flex overflow-hidden",
  canvas: "flex-1 overflow-y-auto px-10 lg:px-20 py-16 scroll-smooth bg-white",
  canvasFaint: "bg-faint",
  article: "mx-auto relative max-w-[820px]",
  blockGroup: "group relative",
  blockToolbar:
    "absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10",
  blockToolbarBtn:
    "p-2 bg-white border border-border rounded-lg text-muted hover:text-forest hover:border-forest/40 transition-colors cursor-pointer shadow-sm",
  blockSelected: "outline-2 outline-dashed outline-forest rounded",
  /* Blocks carry the rhythm (margin-block: var(--block-gap)); the zone only
     needs a minimal own margin — neighbor margins collapse to 24px. */
  insertZone:
    "my-2 py-5 border border-dashed border-border flex items-center justify-center group cursor-pointer hover:bg-gray-50 transition-all rounded-xl",
  insertZoneInner: "flex items-center gap-3 text-muted group-hover:text-forest transition-colors",
  insertZoneLabel: "text-xs font-bold uppercase tracking-widest",
  editableFocus: "focus:outline-2 focus:outline-dashed focus:outline-forest focus:outline-offset-8 focus:rounded",

  /* Changelog panel */
  changelogPanel: "w-80 border-l border-border bg-[#fcfcfc] flex flex-col shrink-0 overflow-hidden",
  changelogHead: "p-6 border-b border-border bg-white flex items-center justify-between",
  changelogTitle: "text-xs font-bold uppercase tracking-widest text-ink",
  changelogCount: "text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded",
  changelogScroll: "flex-1 overflow-y-auto p-6 space-y-8",
  logItem: "relative pl-6 pb-2",
  logItemBordered: "relative pl-6 pb-2 border-l border-border ml-1",
  logDotActive: "absolute left-0 top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-50",
  logDot: "absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-border",
  logLabelRow: "flex items-center justify-between",
  logLabelActive: "text-[10px] font-bold text-amber-600 uppercase tracking-widest",
  logLabel: "text-[10px] font-bold text-muted uppercase tracking-widest",
  logDate: "text-[9px] font-medium text-muted",
  logCardActive: "p-4 bg-white border border-amber-100 rounded-xl shadow-sm",
  logCard: "p-4 bg-faint border border-border rounded-xl",
  logText: "text-xs text-ink leading-relaxed mb-3",
  logTextMuted: "text-xs text-muted leading-relaxed mb-3 italic",
  logAuthorRow: "flex items-center gap-2",
  logAuthor: "text-[10px] font-bold text-muted uppercase tracking-widest",
  logActions: "flex gap-2",
  changelogFoot: "p-6 border-t border-border bg-white",

  /* Modal (palette + block inspector) */
  modalOverlay: "fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-8",
  modal: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8",
  modalTitle: "font-serif text-2xl font-bold tracking-tight mb-6",
  paletteGrid: "grid grid-cols-2 gap-3",
  paletteItem:
    "flex flex-col items-start gap-1 p-4 border border-border rounded-xl text-left hover:border-forest hover:bg-moss/30 transition-all cursor-pointer",
  paletteItemLabel: "text-sm font-bold text-ink",
  paletteItemHint: "text-xs text-muted",

  /* Draft preview mode */
  draftBanner: "w-full px-6 py-2.5 flex items-center justify-between border-b",
  draftBannerAmber: "bg-amber-50 border-amber-200",
  draftBannerGreen: "bg-green-50 border-green-200",
  draftBannerRed: "bg-red-50 border-red-200",
  draftBannerLabel: "flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest",
  draftBannerText: "text-xs",
  floatBar:
    "fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink text-white rounded-2xl px-5 py-3 shadow-2xl shadow-black/30",
  floatBarDivider: "w-px h-4 bg-white/20",
  floatBarBtn:
    "flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer",
  floatBarSubmit:
    "flex items-center gap-1.5 text-xs font-bold bg-forest hover:bg-sage text-white px-4 py-1.5 rounded-lg transition-all ml-1 cursor-pointer",

  /* Diff highlight in preview */
  diffNew: "bg-green-400/10 border-l-[3px] border-green-400 pl-2.5 rounded-r",
  diffRemoved: "bg-red-400/10 border-l-[3px] border-red-400 pl-2.5 rounded-r line-through opacity-60",
} as const;
