import type { Block, BlockType, Page, Playbook } from "./types";
import { defaultTheme } from "./theme";

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* Human labels + descriptions for the editor palette */
export const BLOCK_LABELS: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Capa verde em destaque com título e tags" },
  card: { label: "Card", hint: "Cartão com ícone, título e lista/texto" },
  cardGrid: { label: "Grade de cards", hint: "Cards lado a lado em grade" },
  alert: { label: "Alerta", hint: "Faixa de aviso (info/sucesso/atenção)" },
  checklist: { label: "Checklist", hint: "Lista com caixas de marcação" },
  timeline: { label: "Timeline", hint: "Etapas em linha do tempo com badges" },
  pillRow: { label: "Pills", hint: "Fileira de etiquetas coloridas" },
  contributors: { label: "Contribuições", hint: "Cartões de aprendizados com autor" },
  table: { label: "Tabela", hint: "Tabela com colunas configuráveis" },
  letterCards: { label: "Cartões de letras", hint: "Letras grandes (ex.: STAR)" },
  qaList: { label: "Perguntas & porquês", hint: "Lista de perguntas com o que revelam" },
  formatCards: { label: "Cards de formato", hint: "Cards com bolinha colorida e nota" },
  changelog: { label: "Changelog", hint: "Entradas de versão com mudanças" },
  subHeading: { label: "Subtítulo de seção", hint: "Rótulo pequeno em caixa alta" },
  separator: { label: "Separador", hint: "Linha divisória" },
  richText: { label: "Texto", hint: "Parágrafo de texto livre" },
  image: { label: "Imagem", hint: "Imagem com legenda opcional" },
  quote: { label: "Citação", hint: "Citação em destaque com autor" },
  ctaButton: { label: "Botão de ação", hint: "Botão/link de destaque" },
};

export function createBlock(type: BlockType): Block {
  const id = newId("b");
  switch (type) {
    case "hero":
      return {
        id,
        type,
        props: { eyebrow: "Eyebrow", title: "Título de destaque", body: "Texto de apoio.", metaTags: [] },
      };
    case "card":
      return { id, type, props: { icon: "book", iconColor: "teal", title: "Novo card", items: ["Item"] } };
    case "cardGrid":
      return {
        id,
        type,
        props: {
          columns: 2,
          cards: [
            { icon: "book", iconColor: "teal", title: "Card A", items: ["Item"] },
            { icon: "target", iconColor: "blue", title: "Card B", items: ["Item"] },
          ],
        },
      };
    case "alert":
      return { id, type, props: { variant: "info", icon: "info", body: "Mensagem do alerta." } };
    case "checklist":
      return { id, type, props: { title: "Checklist", icon: "clipboard-check", items: ["Item"] } };
    case "timeline":
      return {
        id,
        type,
        props: {
          title: "Timeline",
          icon: "clock",
          items: [{ label: "Etapa", badgeText: "~10 min", badgeColor: "gray", body: "Descrição." }],
        },
      };
    case "pillRow":
      return { id, type, props: { items: [{ text: "Pill", color: "teal" }] } };
    case "contributors":
      return {
        id,
        type,
        props: { label: "Keep doing", variant: "keep", entries: [{ author: "Nome", text: "Aprendizado." }] },
      };
    case "table":
      return {
        id,
        type,
        props: { columns: ["Coluna 1", "Coluna 2"], rows: [["Valor", "Valor"]] },
      };
    case "letterCards":
      return {
        id,
        type,
        props: { items: [{ letter: "S", word: "Situation", question: "", look: "" }] },
      };
    case "qaList":
      return {
        id,
        type,
        props: { title: "Example questions", items: [{ q: "Pergunta?", why: "O que revela." }] },
      };
    case "formatCards":
      return {
        id,
        type,
        props: {
          label: "Formatos",
          items: [{ dotColor: "#679747", title: "Formato", desc: "Descrição.", note: "Nota." }],
        },
      };
    case "changelog":
      return {
        id,
        type,
        props: {
          entries: [
            { version: "v1.0", date: "Hoje", badgeColor: "teal", typeLabel: "Release", changes: ["Mudança"] },
          ],
        },
      };
    case "subHeading":
      return { id, type, props: { text: "Subtítulo" } };
    case "separator":
      return { id, type, props: {} };
    case "richText":
      return { id, type, props: { body: "Escreva aqui." } };
    case "image":
      return { id, type, props: { src: "https://placehold.co/720x360", alt: "Imagem", caption: "" } };
    case "quote":
      return { id, type, props: { text: "Citação.", author: "" } };
    case "ctaButton":
      return { id, type, props: { label: "Saiba mais", href: "https://", variant: "primary" } };
  }
}

export function createPage(n: number): Page {
  return {
    id: newId("pagina"),
    label: `Nova página ${n}`,
    icon: "book",
    eyebrow: "Pyyne Digital",
    title: `Nova página ${n}`,
    subtitle: "Descrição da página.",
    blocks: [],
  };
}

export function createPlaybook(input: {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}): Playbook {
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return {
    schemaVersion: 1,
    meta: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      version: "v0.1",
      lastUpdated: today,
      tags: input.tags,
      favicon: "🌱",
    },
    theme: defaultTheme,
    nav: [{ group: "Getting Started", pageIds: ["overview"] }],
    pages: [
      {
        id: "overview",
        label: "Overview",
        icon: "book",
        eyebrow: "Pyyne Digital",
        title: input.title,
        subtitle: input.description,
        blocks: [
          {
            id: newId("b"),
            type: "hero",
            props: {
              eyebrow: "Playbook",
              title: input.title,
              body: input.description,
              metaTags: input.tags,
            },
          },
        ],
      },
    ],
  };
}
