import { z } from "zod";

/* ── Theme ─────────────────────────────────────────── */

export const ThemeSchema = z.object({
  colors: z.object({
    brand: z.string(),
    brandDark: z.string(),
    brandDeep: z.string(),
    brandLight: z.string(),
    brandMid: z.string(),
    brandSage: z.string(),
    brandSoft: z.string(),
    ink: z.string(),
    ink2: z.string(),
    ink3: z.string(),
    ink4: z.string(),
    surface: z.string(),
    surface2: z.string(),
    surface3: z.string(),
    accentBlue: z.string(),
    accentBlueLight: z.string(),
    accentAmber: z.string(),
    accentAmberLight: z.string(),
    accentRed: z.string(),
    accentRedLight: z.string(),
    accentPurple: z.string(),
    accentPurpleLight: z.string(),
  }),
  fonts: z.object({
    display: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
  radii: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
  }),
  layout: z.object({
    sidebarWidth: z.string(),
    contentMax: z.string(),
    headerH: z.string(),
  }),
});

/* ── Blocks ────────────────────────────────────────── */

export const IconColorSchema = z.enum(["teal", "blue", "amber", "purple", "red"]);
export const BadgeColorSchema = z.enum(["teal", "blue", "amber", "gray", "purple"]);
export const AlertVariantSchema = z.enum(["info", "warning", "success"]);

export const CardSchema = z.object({
  icon: z.string().optional(),
  iconColor: IconColorSchema.default("teal"),
  title: z.string(),
  body: z.string().optional(),
  items: z.array(z.string()).optional(),
  highlight: z.boolean().optional(),
});

const BaseBlock = z.object({ id: z.string() });

export const BlockSchema = z.discriminatedUnion("type", [
  BaseBlock.extend({
    type: z.literal("hero"),
    props: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      metaTags: z.array(z.string()).default([]),
    }),
  }),
  BaseBlock.extend({ type: z.literal("card"), props: CardSchema }),
  BaseBlock.extend({
    type: z.literal("cardGrid"),
    props: z.object({
      columns: z.union([z.literal(2), z.literal(3), z.literal("auto")]).default(2),
      cards: z.array(CardSchema),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("alert"),
    props: z.object({
      variant: AlertVariantSchema,
      icon: z.string(),
      body: z.string(),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("checklist"),
    props: z.object({
      title: z.string(),
      icon: z.string().default("clipboard-check"),
      items: z.array(z.string()),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("timeline"),
    props: z.object({
      title: z.string(),
      icon: z.string().default("clock"),
      items: z.array(
        z.object({
          label: z.string(),
          badgeText: z.string(),
          badgeColor: BadgeColorSchema.default("gray"),
          body: z.string(),
        })
      ),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("pillRow"),
    props: z.object({
      items: z.array(z.object({ text: z.string(), color: BadgeColorSchema.default("teal") })),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("contributors"),
    props: z.object({
      label: z.string(),
      variant: z.enum(["keep", "change"]),
      entries: z.array(z.object({ author: z.string(), text: z.string() })),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("table"),
    props: z.object({
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("letterCards"),
    props: z.object({
      items: z.array(
        z.object({
          letter: z.string(),
          word: z.string(),
          question: z.string().optional(),
          look: z.string().optional(),
        })
      ),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("qaList"),
    props: z.object({
      title: z.string(),
      items: z.array(z.object({ q: z.string(), why: z.string() })),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("formatCards"),
    props: z.object({
      label: z.string().optional(),
      items: z.array(
        z.object({
          dotColor: z.string(),
          title: z.string(),
          desc: z.string(),
          note: z.string(),
        })
      ),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("changelog"),
    props: z.object({
      entries: z.array(
        z.object({
          version: z.string(),
          date: z.string(),
          badgeColor: BadgeColorSchema.default("teal"),
          typeLabel: z.string(),
          changes: z.array(z.string()),
        })
      ),
    }),
  }),
  BaseBlock.extend({ type: z.literal("subHeading"), props: z.object({ text: z.string() }) }),
  BaseBlock.extend({ type: z.literal("separator"), props: z.object({}) }),
  BaseBlock.extend({ type: z.literal("richText"), props: z.object({ body: z.string() }) }),
  BaseBlock.extend({
    type: z.literal("image"),
    props: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      width: z.string().optional(),
    }),
  }),
  BaseBlock.extend({
    type: z.literal("quote"),
    props: z.object({ text: z.string(), author: z.string().optional() }),
  }),
  BaseBlock.extend({
    type: z.literal("ctaButton"),
    props: z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(["primary", "outline"]).default("primary"),
    }),
  }),
]);

export const BLOCK_TYPES = [
  "hero",
  "card",
  "cardGrid",
  "alert",
  "checklist",
  "timeline",
  "pillRow",
  "contributors",
  "table",
  "letterCards",
  "qaList",
  "formatCards",
  "changelog",
  "subHeading",
  "separator",
  "richText",
  "image",
  "quote",
  "ctaButton",
] as const;

/* ── Pages / Nav / Meta ────────────────────────────── */

export const PageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  icon: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  blocks: z.array(BlockSchema),
});

export const NavGroupSchema = z.object({
  group: z.string(),
  pageIds: z.array(z.string()),
});

export const MetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  lastUpdated: z.string(),
  tags: z.array(z.string()),
  favicon: z.string(),
});

export const PlaybookSchema = z.object({
  schemaVersion: z.literal(1),
  meta: MetaSchema,
  theme: ThemeSchema,
  nav: z.array(NavGroupSchema),
  pages: z.array(PageSchema),
});

export const AdminsSchema = z.object({
  admins: z.array(
    z.object({
      email: z.string().email(),
      canSelfApprove: z.boolean().default(false),
    })
  ),
});
