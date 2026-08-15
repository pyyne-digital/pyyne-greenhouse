import { z } from "zod";
import {
  AdminsSchema,
  BlockSchema,
  CardSchema,
  MetaSchema,
  NavGroupSchema,
  PageSchema,
  PlaybookSchema,
  ThemeSchema,
} from "./schema";

export type Theme = z.infer<typeof ThemeSchema>;
export type Card = z.infer<typeof CardSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block["type"];
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;
export type Page = z.infer<typeof PageSchema>;
export type NavGroup = z.infer<typeof NavGroupSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type Playbook = z.infer<typeof PlaybookSchema>;
export type Admins = z.infer<typeof AdminsSchema>;

export interface ProposalAuthor {
  email: string;
  name: string;
  avatar?: string;
}

export interface ProposalMeta {
  type: "edit" | "create";
  playbook: string;
  playbookTitle: string;
  author: ProposalAuthor;
  summary: string;
  createdAt: string;
}
