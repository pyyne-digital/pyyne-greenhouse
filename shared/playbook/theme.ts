import type { Theme } from "./types";

/* Default theme = Pyyne playbook design tokens (ported from playbook.css) */
export const defaultTheme: Theme = {
  colors: {
    brand: "#679747",
    brandDark: "#4a6e32",
    brandDeep: "#35521f",
    brandLight: "#eef4e8",
    brandMid: "#99BA82",
    brandSage: "#C4D7B6",
    brandSoft: "#B1CAA0",
    ink: "#111110",
    ink2: "#3a3a38",
    ink3: "#6b6b68",
    ink4: "#9a9a96",
    surface: "#ffffff",
    surface2: "#f8f7f4",
    surface3: "#f0ede8",
    accentBlue: "#185FA5",
    accentBlueLight: "#E6F1FB",
    accentAmber: "#854F0B",
    accentAmberLight: "#FAEEDA",
    accentRed: "#A32D2D",
    accentRedLight: "#FCEBEB",
    accentPurple: "#534AB7",
    accentPurpleLight: "#EEEDFE",
  },
  fonts: {
    display: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', 'Fira Code', monospace",
  },
  radii: { sm: "6px", md: "10px", lg: "16px", xl: "24px" },
  layout: { sidebarWidth: "260px", contentMax: "780px", headerH: "56px" },
};

export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    "--brand": c.brand,
    "--brand-dark": c.brandDark,
    "--brand-deep": c.brandDeep,
    "--brand-light": c.brandLight,
    "--brand-mid": c.brandMid,
    "--brand-sage": c.brandSage,
    "--brand-soft": c.brandSoft,
    "--ink": c.ink,
    "--ink-2": c.ink2,
    "--ink-3": c.ink3,
    "--ink-4": c.ink4,
    "--surface": c.surface,
    "--surface-2": c.surface2,
    "--surface-3": c.surface3,
    "--accent-blue": c.accentBlue,
    "--accent-blue-light": c.accentBlueLight,
    "--accent-amber": c.accentAmber,
    "--accent-amber-light": c.accentAmberLight,
    "--accent-red": c.accentRed,
    "--accent-red-light": c.accentRedLight,
    "--accent-purple": c.accentPurple,
    "--accent-purple-light": c.accentPurpleLight,
    "--font-display": theme.fonts.display,
    "--font-body": theme.fonts.body,
    "--font-mono": theme.fonts.mono,
    "--radius-sm": theme.radii.sm,
    "--radius-md": theme.radii.md,
    "--radius-lg": theme.radii.lg,
    "--radius-xl": theme.radii.xl,
    "--sidebar-width": theme.layout.sidebarWidth,
    "--content-max": theme.layout.contentMax,
    "--header-h": theme.layout.headerH,
  };
}

export function themeToCssText(theme: Theme): string {
  const vars = themeToCssVars(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n${body}\n}`;
}
