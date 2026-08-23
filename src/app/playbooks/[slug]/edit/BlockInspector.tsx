"use client";

import React from "react";
import type { Block, BlockOf, Card } from "@playbook/index";
import { ColorField, IconField, SelectField, StringListField, TextField, iconBtn, listRow } from "@/components/fields";

type Update = (mutate: (props: never) => void) => void;

function useProps<T extends Block>(block: T, update: (mutate: (b: T) => void) => void) {
  return (fn: (p: T["props"]) => void) => update((b) => fn(b.props));
}

const ICON_COLORS = [
  { value: "teal", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "purple", label: "Purple" },
  { value: "red", label: "Red" },
];

const BADGE_COLORS = [
  { value: "teal", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "gray", label: "Gray" },
  { value: "purple", label: "Purple" },
];

function CardFields({ card, onChange }: { card: Card; onChange: (c: Card) => void }) {
  return (
    <>
      <IconField label="Icon" value={card.icon ?? "book"} onChange={(v) => onChange({ ...card, icon: v })} />
      <SelectField
        label="Icon color"
        value={card.iconColor}
        options={ICON_COLORS}
        onChange={(v) => onChange({ ...card, iconColor: v as Card["iconColor"] })}
      />
      <TextField label="Title" value={card.title} onChange={(v) => onChange({ ...card, title: v })} />
      <TextField
        label="Body (optional)"
        value={card.body ?? ""}
        multiline
        onChange={(v) => onChange({ ...card, body: v || undefined })}
      />
      <StringListField
        label="Items (optional)"
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
        Highlight (light green background)
      </label>
    </>
  );
}

function HeroInspector({ block, update }: { block: BlockOf<"hero">; update: Update }) {
  const p = useProps(block, update as never);
  return (
    <>
      <TextField label="Eyebrow" value={block.props.eyebrow} onChange={(v) => p((x) => (x.eyebrow = v))} />
      <TextField label="Title" value={block.props.title} onChange={(v) => p((x) => (x.title = v))} />
      <TextField label="Body" multiline value={block.props.body} onChange={(v) => p((x) => (x.body = v))} />
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
        label="Columns"
        value={String(block.props.columns)}
        options={[
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
          { value: "auto", label: "Auto" },
        ]}
        onChange={(v) =>
          p((x) => (x.columns = v === "auto" ? "auto" : (Number(v) as 2 | 3)))
        }
      />
      {block.props.cards.map((c, i) => (
        <details key={i} style={{ marginBottom: 8 }}>
          <summary style={{ fontSize: 13, cursor: "pointer" }}>
            Card {i + 1}: {c.title || "(untitled)"}
          </summary>
          <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
            <CardFields card={c} onChange={(nc) => setCard(i, nc)} />
            <button
              type="button"
              className={iconBtn}
              onClick={() => p((x) => x.cards.splice(i, 1))}
            >
              Remove card
            </button>
          </div>
        </details>
      ))}
      <button
        type="button"
        className={iconBtn}
        onClick={() =>
          p((x) => x.cards.push({ icon: "book", iconColor: "teal", title: "New card", items: ["Item"] }))
        }
      >
        + Add card
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
            label="Variant"
            value={b.props.variant}
            options={[
              { value: "info", label: "Info (blue)" },
              { value: "warning", label: "Warning (amber)" },
              { value: "success", label: "Success (green)" },
            ]}
            onChange={(v) => p((x) => (x.variant = v as never))}
          />
          <IconField label="Icon" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          <TextField label="Text" multiline value={b.props.body} onChange={(v) => p((x) => (x.body = v))} />
        </>
      );
    }

    case "checklist": {
      const b = block as BlockOf<"checklist">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Title" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          <IconField label="Icon" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          <StringListField label="Items" items={b.props.items} onChange={(items) => p((x) => (x.items = items))} />
        </>
      );
    }

    case "timeline": {
      const b = block as BlockOf<"timeline">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Title" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          <IconField label="Icon" value={b.props.icon} onChange={(v) => p((x) => (x.icon = v))} />
          {b.props.items.map((t, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{t.label || `Step ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Label" value={t.label} onChange={(v) => p((x) => (x.items[i].label = v))} />
                <TextField
                  label="Badge"
                  value={t.badgeText}
                  onChange={(v) => p((x) => (x.items[i].badgeText = v))}
                />
                <SelectField
                  label="Badge color"
                  value={t.badgeColor}
                  options={BADGE_COLORS}
                  onChange={(v) => p((x) => (x.items[i].badgeColor = v as never))}
                />
                <TextField label="Text" multiline value={t.body} onChange={(v) => p((x) => (x.items[i].body = v))} />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remove step
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className={iconBtn}
            onClick={() => p((x) => x.items.push({ label: "Step", badgeText: "", badgeColor: "gray", body: "" }))}
          >
            + Add step
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
            <div className={listRow} key={i}>
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
              <button type="button" className={iconBtn} onClick={() => p((x) => x.items.splice(i, 1))}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={iconBtn} onClick={() => p((x) => x.items.push({ text: "Pill", color: "teal" }))}>
            + Add pill
          </button>
        </>
      );
    }

    case "contributors": {
      const b = block as BlockOf<"contributors">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Section label" value={b.props.label} onChange={(v) => p((x) => (x.label = v))} />
          <SelectField
            label="Variant"
            value={b.props.variant}
            options={[
              { value: "keep", label: "Keep doing (green)" },
              { value: "change", label: "Could change (blue)" },
            ]}
            onChange={(v) => p((x) => (x.variant = v as never))}
          />
          {b.props.entries.map((e, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{e.author || `Entry ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Author" value={e.author} onChange={(v) => p((x) => (x.entries[i].author = v))} />
                <TextField label="Text" multiline value={e.text} onChange={(v) => p((x) => (x.entries[i].text = v))} />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.entries.splice(i, 1))}>
                  Remove
                </button>
              </div>
            </details>
          ))}
          <button type="button" className={iconBtn} onClick={() => p((x) => x.entries.push({ author: "", text: "" }))}>
            + Add entry
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
            label="Columns"
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
          <label>Rows</label>
          {b.props.rows.map((row, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>Row {i + 1}: {row[0] || ""}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                {row.map((cell, j) => (
                  <TextField
                    key={j}
                    label={b.props.columns[j] ?? `Column ${j + 1}`}
                    value={cell}
                    multiline
                    onChange={(v) => p((x) => (x.rows[i][j] = v))}
                  />
                ))}
                <button type="button" className={iconBtn} onClick={() => p((x) => x.rows.splice(i, 1))}>
                  Remove row
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className={iconBtn}
            onClick={() => p((x) => x.rows.push(x.columns.map(() => "")))}
          >
            + Add row
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
                <TextField label="Letter" value={l.letter} onChange={(v) => p((x) => (x.items[i].letter = v))} />
                <TextField label="Word" value={l.word} onChange={(v) => p((x) => (x.items[i].word = v))} />
                <TextField label="Question" value={l.question ?? ""} onChange={(v) => p((x) => (x.items[i].question = v))} />
                <TextField label="What to look for" multiline value={l.look ?? ""} onChange={(v) => p((x) => (x.items[i].look = v))} />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remove
                </button>
              </div>
            </details>
          ))}
          <button type="button" className={iconBtn} onClick={() => p((x) => x.items.push({ letter: "?", word: "New", question: "", look: "" }))}>
            + Add letter
          </button>
        </>
      );
    }

    case "qaList": {
      const b = block as BlockOf<"qaList">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Title" value={b.props.title} onChange={(v) => p((x) => (x.title = v))} />
          {b.props.items.map((e, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{e.q.slice(0, 48) || `Question ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <TextField label="Question" multiline value={e.q} onChange={(v) => p((x) => (x.items[i].q = v))} />
                <TextField label="Reveals" multiline value={e.why} onChange={(v) => p((x) => (x.items[i].why = v))} />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remove
                </button>
              </div>
            </details>
          ))}
          <button type="button" className={iconBtn} onClick={() => p((x) => x.items.push({ q: "", why: "" }))}>
            + Add question
          </button>
        </>
      );
    }

    case "formatCards": {
      const b = block as BlockOf<"formatCards">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Label (optional)" value={b.props.label ?? ""} onChange={(v) => p((x) => (x.label = v || undefined))} />
          {b.props.items.map((f, i) => (
            <details key={i} style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 13, cursor: "pointer" }}>{f.title || `Format ${i + 1}`}</summary>
              <div style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid #eef4e8" }}>
                <ColorField label="Dot color" value={f.dotColor} onChange={(v) => p((x) => (x.items[i].dotColor = v))} />
                <TextField label="Title" value={f.title} onChange={(v) => p((x) => (x.items[i].title = v))} />
                <TextField label="Description" multiline value={f.desc} onChange={(v) => p((x) => (x.items[i].desc = v))} />
                <TextField label="Note (italic)" multiline value={f.note} onChange={(v) => p((x) => (x.items[i].note = v))} />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.items.splice(i, 1))}>
                  Remove
                </button>
              </div>
            </details>
          ))}
          <button type="button" className={iconBtn} onClick={() => p((x) => x.items.push({ dotColor: "#679747", title: "", desc: "", note: "" }))}>
            + Add format
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
                <TextField label="Version" value={e.version} onChange={(v) => p((x) => (x.entries[i].version = v))} />
                <TextField label="Data" value={e.date} onChange={(v) => p((x) => (x.entries[i].date = v))} />
                <TextField label="Tipo" value={e.typeLabel} onChange={(v) => p((x) => (x.entries[i].typeLabel = v))} />
                <SelectField
                  label="Badge color"
                  value={e.badgeColor}
                  options={BADGE_COLORS}
                  onChange={(v) => p((x) => (x.entries[i].badgeColor = v as never))}
                />
                <StringListField
                  label="Changes"
                  items={e.changes}
                  onChange={(items) => p((x) => (x.entries[i].changes = items))}
                />
                <button type="button" className={iconBtn} onClick={() => p((x) => x.entries.splice(i, 1))}>
                  Remove entry
                </button>
              </div>
            </details>
          ))}
          <button
            type="button"
            className={iconBtn}
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
            + New entry at the top
          </button>
        </>
      );
    }

    case "subHeading": {
      const b = block as BlockOf<"subHeading">;
      return <TextField label="Text" value={b.props.text} onChange={(v) => update(((bb: BlockOf<"subHeading">) => (bb.props.text = v)) as never)} />;
    }

    case "separator":
      return <p style={{ fontSize: 13, color: "#9a9a96" }}>Separators have no settings.</p>;

    case "richText": {
      const b = block as BlockOf<"richText">;
      return (
        <TextField
          label="Text (supports <strong> and <em>)"
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
          <TextField label="Image URL" value={b.props.src} onChange={(v) => p((x) => (x.src = v))} />
          <TextField label="Alt text" value={b.props.alt} onChange={(v) => p((x) => (x.alt = v))} />
          <TextField label="Caption (optional)" value={b.props.caption ?? ""} onChange={(v) => p((x) => (x.caption = v || undefined))} />
          <TextField label="CSS width (optional, e.g. 480px)" value={b.props.width ?? ""} onChange={(v) => p((x) => (x.width = v || undefined))} />
        </>
      );
    }

    case "quote": {
      const b = block as BlockOf<"quote">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Quote" multiline value={b.props.text} onChange={(v) => p((x) => (x.text = v))} />
          <TextField label="Author (optional)" value={b.props.author ?? ""} onChange={(v) => p((x) => (x.author = v || undefined))} />
        </>
      );
    }

    case "ctaButton": {
      const b = block as BlockOf<"ctaButton">;
      const p = useProps(b, update as never);
      return (
        <>
          <TextField label="Label" value={b.props.label} onChange={(v) => p((x) => (x.label = v))} />
          <TextField label="Link (https://...)" value={b.props.href} onChange={(v) => p((x) => (x.href = v))} />
          <SelectField
            label="Variant"
            value={b.props.variant}
            options={[
              { value: "primary", label: "Primary (green)" },
              { value: "outline", label: "Outline" },
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
