/** App shell (sidebar + content) class constants. */
export const shell = {
  layout: "flex h-screen w-full overflow-hidden",
  sidebar: "w-64 flex-shrink-0 flex flex-col py-8 px-6 border-r border-border bg-white z-10",
  brand: "flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity",
  brandName: "font-serif text-xl font-bold tracking-tight",
  newPlaybookBtn:
    "flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-forest text-white text-sm font-bold hover:bg-sage transition-all mb-10",
  navGroup: "space-y-1",
  navSection: "space-y-10",
  navLabel: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-4 px-3",
  navItem: "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
  navItemActive: "bg-moss text-forest font-bold",
  navItemIdle: "text-muted hover:bg-moss/50 hover:text-ink",
  navItemInner: "flex items-center gap-3",
  userRow: "mt-auto pt-6 border-t border-border",
  userChip: "flex items-center gap-3 px-1",
  userAvatar: "w-8 h-8 rounded-full object-cover",
  userName: "text-xs font-bold",
  userRole: "text-[9px] font-bold uppercase tracking-wider text-muted",
  content: "flex-1 overflow-y-auto px-12 lg:px-24 py-16",
} as const;
