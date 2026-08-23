/** Home screen (The Archive) class constants. */
export const home = {
  header: "mb-16",
  statsGrid: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-20",
  statCard: "bg-white border border-border rounded-2xl p-8 flex items-center justify-between",
  statLabel: "text-[10px] font-bold text-muted uppercase tracking-widest mb-1",
  statValue: "font-serif text-4xl font-bold",
  statIconBox: "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",

  section: "mb-24",
  sectionHeader: "flex items-baseline justify-between mb-10",
  sectionTitle: "font-serif text-3xl font-bold tracking-tight",
  sectionRule: "h-px flex-1 mx-10 bg-border",
  sectionAside: "text-[10px] font-bold text-muted uppercase tracking-widest",

  playbookGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8",
  playbookCard: "archive-card bg-white border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm",
  playbookHero: "h-40 bg-forest p-10 flex flex-col justify-end relative overflow-hidden",
  playbookVersion:
    "text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-2 py-1 rounded",
  playbookTitle: "font-serif text-2xl font-bold text-white leading-tight z-10",
  playbookBody: "p-8",
  playbookTagRow: "flex items-center gap-2 mb-4",
  playbookOfficial: "text-[10px] font-bold text-forest bg-moss px-2 py-0.5 rounded uppercase tracking-widest",
  playbookTag: "text-[10px] font-bold text-muted uppercase tracking-widest",
  playbookDesc: "text-sm text-muted leading-relaxed mb-8 line-clamp-2",
  playbookFooter: "flex items-center justify-between pt-6 border-t border-border",
  playbookUpdated: "text-[10px] font-bold text-muted uppercase tracking-widest",
  playbookOpen: "text-[10px] font-bold text-forest uppercase tracking-widest inline-flex items-center gap-1.5",

  suggestionGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  suggestionCard:
    "bg-white border border-border border-dashed rounded-2xl p-8 hover:border-forest hover:bg-moss/20 transition-all group cursor-pointer h-full",
  suggestionEmoji:
    "w-12 h-12 bg-white border border-border rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform",
  suggestionTitle: "font-serif text-xl font-bold mb-2",
  suggestionDesc: "text-xs text-muted leading-relaxed mb-6",
  suggestionCta:
    "text-[9px] font-bold text-forest uppercase tracking-widest inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",

  empty: "text-muted text-sm",
} as const;
