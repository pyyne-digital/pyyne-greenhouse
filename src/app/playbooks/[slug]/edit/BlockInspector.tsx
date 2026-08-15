"use client";

import React from "react";
import type { Block, BlockOf, Card } from "@playbook/index";
import { ColorField, IconField, SelectField, StringListField, TextField } from "@/components/fields";

type Update = (mutate: (props: never) => void) => void;

function useProps<T extends Block>(block: T, update: (mutate: (b: T) => void) => void) {
  return (fn: (p: T["props"]) => void) => update((b) => fn(b.props));
}

const ICON_COLORS = [
  { value: "teal", label: "Verde" },
  { value: "blue", label: "Azul" },
  { value: "amber", label: "Âmbar" },
  { value: "purple", label: "Roxo" },
  { value: "red", label: "Vermelho" },
];

const BADGE_COLORS = [
  { value: "teal", label: "Verde" },
  { value: "blue", label: "Azul" },
  { value: "amber", label: "Âmbar" },
  { value: "gray", label: "Cinza" },
  { value: "purple", label: "Roxo" },
];

function CardFields({ card, onChange }: { card: Card; onChange: (c: Card) => void }) {
  return (
    <>
      <IconField label="Ícone" value={card.icon ?? "book"} onChange={(v) => onChange({ ...card, icon: v })} />
      <SelectField
        label="Cor do ícone"
        value={card.iconColor}
        options={ICON_COLORS}
        onChange={(v) => onChange({ ...card, iconColor: v as Card["iconColor"] })}
      />
      <TextField label="Título" value={card.title} onChange={(v) => onChange({ ...card, title: v })} />
      <TextField
        label="Texto (opcional)"
        value={card.body ?? ""}
        multiline
        onChange={(v) => onChange({ ...card, body: v || undefined })}
      />
      <StringListField
        label="Itens (opcional)"
        items={card.items ?? []}
        onChange={(items) => onChange({ ...card, items })}
      />
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={card.highlight ?? false}
          onChange={(e) => onChange({ ...card, highlight: e.target.checked || undefined })}
          style={{ width: "auto" }}
        />
        Destaque (fundo verde claro)
      </label>
    </>
  );
}

function HeroInspector({ block, update }: { block: BlockOf<"hero">; update: Update }) {
  const p = useProps(block, update as never);
  return (
    <>
      <TextField label="Eyebrow" value={block.props.eyebrow} onChange={(v) => p((x) => (x.eyebrow = v))} />
      <TextField label="Título" value={block.props.title} onChange={(v) => p((x) => (x.title = v))} />
      <TextField label="Corpo" multiline value={block.props.body} onChange={(v) => p((x) => (x.body = v))} />
      <StringListField
        label="Tags"
        items={block.props.metaTags}
        multiline={false}
        onChange={(items) => p((x) => (x.metaTags = items))}
      />
    </>
  );
}

function CardGridInspector({ block, update }: { block: BlockOf<"cardGrid">; update: Update }) {
  const p = useProps(block, update as never);
  const setCard = (i: number, c: Card) => p((x) => (x.cards[i] = c));
  return (
    <>
      <SelectField
        label="Colunas"
        value={String(block.props.columns)}
        options={[
          { value: "2", label: "2 colunas" },
          { value: "3", label: "3 colunas" },
          { value: "auto", label: "Automático" },
        ]}
        onChange={(v) =>
          p((x) => (x.columns = v === "auto" ? "auto" : (Number(v) as 2 | 3)))
        }
      />
      {block.props.cards.map((c, i) => (
        <details key={i} style={{ marginBottom: 8 }}>
          <summary style={{ fontSize: 13, cursor: "pointer" }}>
            Card {i + 1}: {c.title || "(sem título)"}
          </summary>
          <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
            <CardFields card={c} onChange={(nc) => setCard(i, nc)} />
            <button
              type="button"
              className="gh-icon-btn"
              onClick={() => p((x) => x.cards.splice(i, 1))}
            >
              Remover card
            </button>
          </div>
        </details>
      ))}
      <button
        type="button"
        className="gh-icon-btn"
        onClick={() =>
          p((x) => x.cards.push({ icon: "book", iconColor: "teal", title: "Novo card", items: ["Item"] }))
        }
      >
        + Adicionar card
      </button>
    </>
  );
}

export function BlockInspector({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (mutate: (b: Block) => void) => void;
}) {
  const update = onUpdate as Update;

  switch (block.type) {
    case "hero":
      return <HeroInspector block={block} update={update} />;

    case "card": {
      const b = block as BlockOf<"card">;
      return (
        <CardFields
          card={b.props}
          onChange={(c) => update(((bb: BlockOf<"card">) => Object.assign(bb.props, c)) as never)}
        />
      );
    }

    case "cardGrid":
      return <CardGridInspector block={block} update={update} />;

    case "alert": {
      const b = block as BlockOf<"alert">;
      const p = useProps(b, update as never);
      return (
        <>
          <SelectField
            label="Variante"
            value={b.props.variant}
            options={[
              { value: "info", label: "Info (azul)" },
              { value: "warning", label: "Atenção (âmbar)" },
              { value: "success", label: "Sucesso (verde)" },
            ]}
            onChange={(v) => p((x) => (x.variant = v as never))}
          />
          <IconField label="Ícone" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          <TextField label="Texto" multiline value={b.props.body} onChange={(v) => p((x) => (x.body = v))} />
        </>
      );
    }

    case "checklist": {
      const b = block as BlockOf<"checklist">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Título" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          <IconField label="Ícone" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          <StringListField label="Itens" items={b.props.items} onChange={(items) => p((x) => (x.items = items))} />
        </>
      );
    }

    case "timeline": {
      const b = block as BlockOf<"timeline">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Título" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          <IconField label="Ícone" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          {b.props.items.map((t, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{t.label || `Etapa ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Rótulo" value={t.label} onChange={(v) => p((x) => (x.items[i].label = v))} />
                <TextField
                  label="Badge"
                  value={t.badgeText}
                  onChange={(v) => p((x) => (x.items[i].badgeText = v))}
                />
                <SelectField
                  label="Cor do badge"
                  value={t.badgeColor}
                  options={BADGE_COLORS}
                  onChange={(v) => p((x) => (x.items[i].badgeColor = v as never))}
                />
                <TextField label="Texto" multiline value={t.body} onChange={(v) => p((x) => (x.items[i].body = v))} />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remover etapa
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className="gh-icon-btn"
            onClick={() => p((x) => x.items.push({ label: "Etapa", badgeText: "", badgeColor: "gray", body: "" }))}
          >
            + Adicionar etapa
          </button>
        </>
      );
    }

    case "pillRow": {
      const b = block as BlockOf<"pillRow">;
      const p = useProps(b, update as never);
      return (
        <>
          {b.props.items.map((pill, i) => (
            <div className="gh-field-list-item" key={i}>
              <input type="text" value={pill.text} onChange={(e) => p((x) => (x.items[i].text = e.target.value))} style={{ flex: 1 }} />
              <select
                value={pill.color}
                onChange={(e) => p((x) => (x.items[i].color = e.target.value as never))}
                style={{ width: 100 }}
              >
                {BADGE_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.splice(i, 1))}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.push({ text: "Pill", color: "teal" }))}>
            + Adicionar pill
          </button>
        </>
      );
    }

    case "contributors": {
      const b = block as BlockOf<"contributors">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Rótulo da seção" value={b.props.label} onChange={(v) => p((x) => (x.label = v))} />
          <SelectField
            label="Variante"
            value={b.props.variant}
            options={[
              { value: "keep", label: "Keep doing (verde)" },
              { value: "change", label: "Could change (azul)" },
            ]}
            onChange={(v) => p((x) => (x.variant = v as never))}
          />
          {b.props.entries.map((e, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{e.author || `Contribuição ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Autor" value={e.author} onChange={(v) => p((x) => (x.entries[i].author = v))} />
                <TextField label="Texto" multiline value={e.text} onChange={(v) => p((x) => (x.entries[i].text = v))} />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.entries.splice(i, 1))}>
                  Remover
                </button>
              </div>
            </details>
          ))}
          <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.entries.push({ author: "", text: "" }))}>
            + Adicionar contribuição
          </button>
        </>
      );
    }

    case "table": {
      const b = block as BlockOf<"table">;
      const p = useProps(b, update as never);
      return (
        <>
          <StringListField
            label="Colunas"
            items={b.props.columns}
            multiline={false}
            onChange={(cols) =>
              p((x) => {
                x.columns = cols;
                x.rows = x.rows.map((r) => {
                  const next = r.slice(0, cols.length);
                  while (next.length < cols.length) next.push("");
                  return next;
                });
              })
            }
          />
          <label>Linhas</label>
          {b.props.rows.map((row, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>Linha {i + 1}: {row[0] || ""}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                {row.map((cell, j) => (
                  <TextField
                    key={j}
                    label={b.props.columns[j] ?? `Coluna ${j + 1}`}
                    value={cell}
                    multiline
                    onChange={(v) => p((x) => (x.rows[i][j] = v))}
                  />
                ))}
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.rows.splice(i, 1))}>
                  Remover linha
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className="gh-icon-btn"
            onClick={() => p((x) => x.rows.push(x.columns.map(() => "")))}
          >
            + Adicionar linha
          </button>
        </>
      );
    }

    case "letterCards": {
      const b = block as BlockOf<"letterCards">;
      const p = useProps(b, update as never);
      return (
        <>
          {b.props.items.map((l, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{l.letter} — {l.word}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Letra" value={l.letter} onChange={(v) => p((x) => (x.items[i].letter = v))} />
                <TextField label="Palavra" value={l.word} onChange={(v) => p((x) => (x.items[i].word = v))} />
                <TextField label="Pergunta" value={l.question ?? ""} onChange={(v) => p((x) => (x.items[i].question = v))} />
                <TextField label="O que observar" multiline value={l.look ?? ""} onChange={(v) => p((x) => (x.items[i].look = v))} />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remover
                </button>
              </div>
            </details>
          ))}
          <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.push({ letter: "?", word: "Novo", question: "", look: "" }))}>
            + Adicionar letra
          </button>
        </>
      );
    }

    case "qaList": {
      const b = block as BlockOf<"qaList">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Título" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          {b.props.items.map((e, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{e.q.slice(0, 48) || `Pergunta ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Pergunta" multiline value={e.q} onChange={(v) => p((x) => (x.items[i].q = v))} />
                <TextField label="Revela" multiline value={e.why} onChange={(v) => p((x) => (x.items[i].why = v))} />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remover
                </button>
              </div>
            </details>
          ))}
          <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.push({ q: "", why: "" }))}>
            + Adicionar pergunta
          </button>
        </>
      );
    }

    case "formatCards": {
      const b = block as BlockOf<"formatCards">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Rótulo (opcional)" value={b.props.label ?? ""} onChange={(v) => p((x) => (x.label = v || undefined))} />
          {b.props.items.map((f, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{f.title || `Formato ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <ColorField label="Cor do ponto" value={f.dotColor} onChange={(v) => p((x) => (x.items[i].dotColor = v))} />
                <TextField label="Título" value={f.title} onChange={(v) => p((x) => (x.items[i].title = v))} />
                <TextField label="Descrição" multiline value={f.desc} onChange={(v) => p((x) => (x.items[i].desc = v))} />
                <TextField label="Nota (itálico)" multiline value={f.note} onChange={(v) => p((x) => (x.items[i].note = v))} />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remover
                </button>
              </div>
            </details>
          ))}
          <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.items.push({ dotColor: "#679747", title: "", desc: "", note: "" }))}>
            + Adicionar formato
          </button>
        </>
      );
    }

    case "changelog": {
      const b = block as BlockOf<"changelog">;
      const p = useProps(b, update as never);
      return (
        <>
          {b.props.entries.map((e, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{e.version} — {e.date}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Versão" value={e.version} onChange={(v) => p((x) => (x.entries[i].version = v))} />
                <TextField label="Data" value={e.date} onChange={(v) => p((x) => (x.entries[i].date = v))} />
                <TextField label="Tipo" value={e.typeLabel} onChange={(v) => p((x) => (x.entries[i].typeLabel = v))} />
                <SelectField
                  label="Cor do badge"
                  value={e.badgeColor}
                  options={BADGE_COLORS}
                  onChange={(v) => p((x) => (x.entries[i].badgeColor = v as never))}
                />
                <StringListField
                  label="Mudanças"
                  items={e.changes}
                  onChange={(items) => p((x) => (x.entries[i].changes = items))}
                />
                <button type="button" className="gh-icon-btn" onClick={() => p((x) => x.entries.splice(i, 1))}>
                  Remover entrada
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className="gh-icon-btn"
            onClick={() =>
              p((x) =>
                x.entries.unshift({
                  version: "v0.0",
                  date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                  badgeColor: "teal",
                  typeLabel: "Update",
                  changes: [],
                })
              )
            }
          >
            + Nova entrada no topo
          </button>
        </>
      );
    }

    case "subHeading": {
      const b = block as BlockOf<"subHeading">;
      return <TextField label="Texto" value={b.props.text} onChange={(v) => update(((bb: BlockOf<"subHeading">) => (bb.props.text = v)) as never)} />;
    }

    case "separator":
      return <p style={{ fontSize: 13, color: "#9a9a96" }}>Separador não tem configurações.</p>;

    case "richText": {
      const b = block as BlockOf<"richText">;
      return (
        <TextField
          label="Texto (suporta <strong> e <em>)"
          multiline
          value={b.props.body}
          onChange={(v) => update(((bb: BlockOf<"richText">) => (bb.props.body = v)) as never)}
        />
      );
    }

    case "image": {
      const b = block as BlockOf<"image">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="URL da imagem" value={b.props.src} onChange={(v) => p((x) => (x.src = v))} />
          <TextField label="Texto alternativo" value={b.props.alt} onChange={(v) => p((x) => (x.alt = v))} />
          <TextField label="Legenda (opcional)" value={b.props.caption ?? ""} onChange={(v) => p((x) => (x.caption = v || undefined))} />
          <TextField label="Largura CSS (opcional, ex.: 480px)" value={b.props.width ?? ""} onChange={(v) => p((x) => (x.width = v || undefined))} />
        </>
      );
    }

    case "quote": {
      const b = block as BlockOf<"quote">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Citação" multiline value={b.props.text} onChange={(v) => p((x) => (x.text = v))} />
          <TextField label="Autor (opcional)" value={b.props.author ?? ""} onChange={(v) => p((x) => (x.author = v || undefined))} />
        </>
      );
    }

    case "ctaButton": {
      const b = block as BlockOf<"ctaButton">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Rótulo" value={b.props.label} onChange={(v) => p((x) => (x.label = v))} />
          <TextField label="Link (https://...)" value={b.props.href} onChange={(v) => p((x) => (x.href = v))} />
          <SelectField
            label="Variante"
            value={b.props.variant}
            options={[
              { value: "primary", label: "Primário (verde)" },
              { value: "outline", label: "Contorno" },
            ]}
            onChange={(v) => p((x) => (x.variant = v as never))}
          />
        </>
      );
    }

    default:
      return null;
  }
}
