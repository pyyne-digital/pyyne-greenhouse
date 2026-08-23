/** Version History + Version Detail class constants. */
export const history = {
  /* Header */
  chipRow: "flex items-center gap-3 mb-4",
  playbookName: "font-serif italic text-forest text-sm",

  /* Filters */
  filterBar: "flex items-center justify-between mb-10 pb-6 border-b border-border",
  filterTabs: "flex items-center gap-8",
  filterTab: "text-sm font-bold pb-6 -mb-6 relative z-10 transition-colors cursor-pointer",
  filterTabActive: "text-ink border-b-2 border-forest",
  filterTabIdle: "text-muted hover:text-ink",
  searchWrap: "relative",
  searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm",
  searchInput:
    "pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-xs w-64 focus:outline-none focus:border-forest/30 transition-all",

  /* Timeline */
  monthHeading: "py-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]",
  item: "bg-white border border-border rounded-2xl p-8 flex items-start gap-8 hover:shadow-xl hover:shadow-forest/5 transition-all group relative overflow-hidden",
  itemBar: "absolute top-0 left-0 bottom-0 w-1",
  itemAvatar: "w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm object-cover",
  itemBody: "flex-1 space-y-3",
  itemTopRow: "flex items-center justify-between",
  itemAuthorRow: "flex items-center gap-3",
  itemAuthor: "font-bold text-sm",
  itemDate: "text-[10px] font-bold text-muted uppercase tracking-widest",
  itemTitle: "font-serif text-xl font-bold group-hover:text-forest transition-colors",
  itemSummary: "text-sm text-muted leading-relaxed font-normal",
  itemStats: "flex items-center gap-4 pt-2",
  itemStat: "text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5",
  itemAction:
    "px-6 py-2.5 bg-paper text-muted text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-border group-hover:bg-forest group-hover:text-white group-hover:border-forest cursor-pointer",
  itemActionDanger:
    "px-6 py-2.5 bg-paper text-muted text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-border hover:bg-red-50 hover:text-red-500 hover:border-red-100 cursor-pointer",
  loadMore:
    "text-[10px] font-bold text-muted uppercase tracking-widest border border-border px-8 py-4 rounded-xl hover:bg-paper transition-all cursor-pointer",

  /* Status badges */
  statusInReview: "text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded tracking-widest uppercase",
  statusPublished: "text-[10px] font-bold text-forest bg-moss px-2 py-0.5 rounded tracking-widest uppercase",
  statusRejected: "text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded tracking-widest uppercase",
  statusArchived: "text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded tracking-widest uppercase",

  /* Version Detail */
  detailHeader:
    "h-16 border-b border-border flex items-center justify-between px-8 bg-white/90 backdrop-blur-md sticky top-0 z-50",
  detailBack: "flex items-center gap-2 text-muted hover:text-ink transition-colors text-xs font-bold uppercase tracking-widest",
  detailMeta: "font-serif italic text-muted text-sm",
  detailNote: "text-[10px] font-bold text-muted uppercase tracking-[0.2em]",
  detailLayout: "flex h-[calc(100vh-64px)]",
  detailMetaSidebar: "w-80 border-r border-border bg-white flex flex-col shrink-0 overflow-y-auto p-8 space-y-6",
  detailMetaLabel: "text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4",
  detailContent: "flex-1 overflow-y-auto",
} as const;
