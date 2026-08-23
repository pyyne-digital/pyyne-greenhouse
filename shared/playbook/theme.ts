import type { Theme } from "./types";

/* Default theme = Pyyne playbook design tokens v2 (UX Pilot redesign) */
export const defaultTheme: Theme = {
  colors: {
    brand: "#4b6332",
    brandDark: "#3a4d27",
    brandDeep: "#2c3a1f",
    brandLight: "#f0f2eb",
    brandMid: "#6a8a50",
    brandSage: "#a3b18a",
    brandSoft: "#c5d9b0",
    ink: "#1a1a1a",
    ink2: "#3a3a38",
    ink3: "#666666",
    ink4: "#9a9a96",
    surface: "#ffffff",
    surface2: "#fcfcf9",
    surface3: "#f0ede8",
    accentBlue: "#2563eb",
    accentBlueLight: "#eff6ff",
    accentAmber: "#b45309",
    accentAmberLight: "#fffbeb",
    accentRed: "#dc2626",
    accentRedLight: "#fef2f2",
    accentPurple: "#7c3aed",
    accentPurpleLight: "#f5f3ff",
  },
  fonts: {
    display: "'Newsreader', Georgia, serif",
    body: "'Outfit', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radii: { sm: "6px", md: "10px", lg: "16px", xl: "24px" },
  layout: { sidebarWidth: "256px", contentMax: "820px", headerH: "56px" },
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
