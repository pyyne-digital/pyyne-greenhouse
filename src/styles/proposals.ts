/** Proposals list + Proposal Review class constants. */
export const proposals = {
  /* List */
  header: "mb-16",
  list: "space-y-6",
  card:
    "bg-white border border-border rounded-[32px] p-10 flex items-center gap-10 hover:shadow-xl hover:shadow-ink/5 transition-all cursor-pointer group",
  avatarWrap: "shrink-0 relative",
  avatar:
    "w-16 h-16 rounded-[20px] border-2 border-white shadow-md grayscale group-hover:grayscale-0 transition-all object-cover",
  avatarIcon:
    "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] border-2 border-white",
  cardBody: "flex-1 space-y-2",
  cardAuthorRow: "flex items-center gap-3",
  cardAuthor: "font-bold text-xs text-ink",
  cardTime: "text-neutral-400 text-xs font-medium",
  cardTitle: "font-serif text-2xl tracking-tight group-hover:text-forest transition-colors",
  cardSummary: "text-sm text-muted leading-relaxed line-clamp-1 font-normal",
  cardRight: "shrink-0 flex items-center gap-8",
  cardStats: "text-right",
  cardStatMain: "text-xs font-bold text-forest",
  cardStatSub: "text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1",
  reviewBtn:
    "bg-paper group-hover:bg-forest text-neutral-400 group-hover:text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",

  /* Review page header */
  reviewHeader: "h-20 bg-white border-b border-border flex items-center justify-between px-10 sticky top-0 z-50",
  backBtn:
    "w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-paper hover:text-ink transition-all",
  reviewAuthorAvatar: "w-10 h-10 rounded-full border-2 border-white shadow-sm",
  reviewTitle: "text-sm font-semibold text-ink",
  reviewTitleItalic: "font-serif italic",
  reviewMeta: "text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5",
  reviewActions: "flex items-center gap-4",

  /* Review body */
  reviewMain: "max-w-4xl mx-auto py-16 px-8 space-y-16 pb-32",
  summaryCard: "bg-white border border-border rounded-[32px] p-10 space-y-6 shadow-sm",
  summaryText: "text-2xl font-serif text-ink leading-snug",
  feedLabel: "text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-2",
  changeCard: "bg-white border border-border rounded-[32px] overflow-hidden shadow-sm",
  changeHead: "bg-paper/50 px-8 py-4 border-b border-border flex items-center justify-between",
  changeHeadLeft: "flex items-center gap-4",
  changeName: "text-xs font-bold text-neutral-800 tracking-tight",
  changeContext: "text-[10px] text-neutral-400 font-bold uppercase tracking-widest",
  changeBody: "p-10",
  changeText: "text-xl text-neutral-800 leading-relaxed font-normal",

  /* Theme change swatches */
  swatchRow: "flex items-center gap-16",
  swatchBox: "flex items-center gap-4 bg-paper/30 p-4 rounded-2xl border border-border",
  swatchColor: "w-12 h-12 rounded-xl shadow-sm border-2 border-white",
  swatchValue: "font-mono text-sm text-neutral-600",

  /* Comments */
  commentBubble: "bg-white rounded-2xl p-4 flex gap-4 items-start border border-border shadow-sm",
  commentAvatar: "w-8 h-8 rounded-full",
  commentAuthor: "text-xs font-bold",
  commentTime: "text-[10px] text-neutral-400 font-bold uppercase tracking-widest",
  commentText: "text-sm text-neutral-600 leading-relaxed",
  commentInput:
    "flex-1 bg-transparent border border-border rounded-lg text-xs text-ink focus:border-forest/40 focus:outline-none py-2 px-3",

  /* Sticky footer */
  stickyFooter: "fixed bottom-8 left-1/2 -translate-x-1/2 max-w-4xl w-full px-8 z-50",
  stickyBar:
    "bg-ink text-white p-6 rounded-[32px] flex items-center justify-between shadow-2xl shadow-ink/20 border border-white/10",
  stickyNote: "flex items-center gap-4 text-sm text-white/70 font-normal",
  stickyNoteIcon: "w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white",
  stickyDiscard: "px-6 py-3 text-sm font-semibold text-white/50 hover:text-white transition-colors cursor-pointer",
  stickyApprove:
    "bg-forest hover:bg-sage text-white text-sm font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-forest/20 cursor-pointer",

  /* State banners */
  stateBanner: "px-10 py-3 flex items-center gap-4 text-sm font-semibold",
  statePublished: "bg-green-50 border-b border-green-200 text-green-800",
  stateRejected: "bg-red-50 border-b border-red-200 text-red-800",
} as const;
