import React from "react";
import type { Block, BlockOf, Card } from "../types";
import { Icon } from "../icons";
import { RichText } from "../RichText";

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`pb-badge pb-badge-${color}`}>{text}</span>;
}

export function CardView({ card }: { card: Card }) {
  return (
    <div className={`pb-card${card.highlight ? " pb-card-highlight" : ""}`}>
      <div className="pb-card-header">
        {card.icon ? (
          <div className={`pb-card-icon pb-icon-${card.iconColor}`}>
            <Icon name={card.icon} size={18} />
          </div>
        ) : null}
        <h3>{card.title}</h3>
      </div>
      {card.body ? (
        <p style={card.items?.length ? { marginBottom: 10 } : undefined}>
          <RichText text={card.body} />
        </p>
      ) : null}
      {card.items?.length ? (
        <ul>
          {card.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function HeroBlock({ props }: { props: BlockOf<"hero">["props"] }) {
  return (
    <div className="pb-cover-hero">
      <p className="pb-eyebrow">{props.eyebrow}</p>
      <h2>{props.title}</h2>
      <p>
        <RichText text={props.body} />
      </p>
      <div className="pb-cover-meta">
        {props.metaTags.map((t, i) => (
          <span key={i} className="pb-cover-meta-tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function CardGridBlock({ props }: { props: BlockOf<"cardGrid">["props"] }) {
  const cls =
    props.columns === 3 ? "pb-cols-3" : props.columns === "auto" ? "pb-cols-auto" : "";
  return (
    <div className={`pb-card-grid ${cls}`}>
      {props.cards.map((c, i) => (
        <CardView key={i} card={c} />
      ))}
    </div>
  );
}

function AlertBlock({ props }: { props: BlockOf<"alert">["props"] }) {
  return (
    <div className={`pb-alert pb-alert-${props.variant}`}>
      <Icon name={props.icon} size={18} />
      <p>
        <RichText text={props.body} />
      </p>
    </div>
  );
}

function ChecklistBlock({ props }: { props: BlockOf<"checklist">["props"] }) {
  return (
    <div className="pb-card">
      <div className="pb-card-header">
        <div className="pb-card-icon pb-icon-teal">
          <Icon name={props.icon} size={18} />
        </div>
        <h3>{props.title}</h3>
      </div>
      <ul className="pb-checklist">
        {props.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineBlock({ props }: { props: BlockOf<"timeline">["props"] }) {
  return (
    <div className="pb-card">
      <div className="pb-card-header">
        <div className="pb-card-icon pb-icon-amber">
          <Icon name={props.icon} size={18} />
        </div>
        <h3>{props.title}</h3>
      </div>
      <div className="pb-timeline">
        {props.items.map((t, i) => (
          <div key={i} className="pb-timeline-item">
            <div className="pb-timeline-dot" />
            <h4>
              {t.label} <Badge text={t.badgeText} color={t.badgeColor} />
            </h4>
            <p>
              <RichText text={t.body} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PillRowBlock({ props }: { props: BlockOf<"pillRow">["props"] }) {
  return (
    <div className="pb-pill-row">
      {props.items.map((p, i) => (
        <Badge key={i} text={p.text} color={p.color} />
      ))}
    </div>
  );
}

function ContributorsBlock({ props }: { props: BlockOf<"contributors">["props"] }) {
  return (
    <>
      <p className="pb-sub-heading">{props.label}</p>
      <div className="pb-contrib-grid">
        {props.entries.map((c, i) => (
          <div key={i} className={`pb-contrib-card${props.variant === "change" ? " pb-change" : ""}`}>
            <p className="pb-contrib-author">{c.author}</p>
            <p>
              <RichText text={c.text} />
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function TableBlock({ props }: { props: BlockOf<"table">["props"] }) {
  return (
    <div className="pb-card pb-table-wrap">
      <table className="pb-eval-table">
        <thead>
          <tr>
            {props.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LetterCardsBlock({ props }: { props: BlockOf<"letterCards">["props"] }) {
  return (
    <div className="pb-card-grid">
      {props.items.map((l, i) => (
        <div key={i} className="pb-card pb-letter-card">
          <div className="pb-letter-flex">
            <div className="pb-letter-glyph">{l.letter}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 6 }}>{l.word}</h3>
              {l.question ? <p className="pb-letter-question">Ask: &ldquo;{l.question}&rdquo;</p> : null}
              {l.look ? <p className="pb-letter-look">Look for: {l.look}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QaListBlock({ props }: { props: BlockOf<"qaList">["props"] }) {
  return (
    <>
      <p className="pb-sub-heading">{props.title}</p>
      <div className="pb-card">
        {props.items.map((e, i) => (
          <div key={i} className="pb-qa-item">
            <p className="pb-qa-q">&ldquo;{e.q}&rdquo;</p>
            <p className="pb-qa-why">
              <strong className="pb-qa-reveals">Reveals:</strong> {e.why}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function FormatCardsBlock({ props }: { props: BlockOf<"formatCards">["props"] }) {
  return (
    <>
      {props.label ? <p className="pb-sub-heading">{props.label}</p> : null}
      <div className="pb-card-grid pb-cols-auto">
        {props.items.map((f, i) => (
          <div key={i} className="pb-format-card">
            <h4>
              <span className="pb-format-dot" style={{ background: f.dotColor }} />
              {f.title}
            </h4>
            <p>{f.desc}</p>
            <p className="pb-format-note">{f.note}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ChangelogBlock({ props }: { props: BlockOf<"changelog">["props"] }) {
  return (
    <>
      {props.entries.map((e, i) => (
        <div key={i} className="pb-card">
          <div className="pb-card-header">
            <div className="pb-card-icon pb-icon-teal">
              <Icon name="history" size={18} />
            </div>
            <div>
              <h3>
                {e.version}{" "}
                <span style={{ marginLeft: 6 }}>
                  <Badge text={e.typeLabel} color={e.badgeColor} />
                </span>
              </h3>
              <p className="pb-card-meta">{e.date}</p>
            </div>
          </div>
          <ul>
            {e.changes.map((c, j) => (
              <li key={j}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props} />;
    case "card":
      return <CardView card={block.props} />;
    case "cardGrid":
      return <CardGridBlock props={block.props} />;
    case "alert":
      return <AlertBlock props={block.props} />;
    case "checklist":
      return <ChecklistBlock props={block.props} />;
    case "timeline":
      return <TimelineBlock props={block.props} />;
    case "pillRow":
      return <PillRowBlock props={block.props} />;
    case "contributors":
      return <ContributorsBlock props={block.props} />;
    case "table":
      return <TableBlock props={block.props} />;
    case "letterCards":
      return <LetterCardsBlock props={block.props} />;
    case "qaList":
      return <QaListBlock props={block.props} />;
    case "formatCards":
      return <FormatCardsBlock props={block.props} />;
    case "changelog":
      return <ChangelogBlock props={block.props} />;
    case "subHeading":
      return <p className="pb-sub-heading">{block.props.text}</p>;
    case "separator":
      return <div className="pb-sep" />;
    case "richText":
      return (
        <p className="pb-richtext">
          <RichText text={block.props.body} />
        </p>
      );
    case "image":
      return (
        <figure className="pb-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.props.src} alt={block.props.alt} style={block.props.width ? { width: block.props.width } : undefined} />
          {block.props.caption ? <figcaption>{block.props.caption}</figcaption> : null}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="pb-quote">
          <p>{block.props.text}</p>
          {block.props.author ? <cite>{block.props.author}</cite> : null}
        </blockquote>
      );
    case "ctaButton":
      return (
        <div className={`pb-cta pb-cta-${block.props.variant}`}>
          <a href={block.props.href} target="_blank" rel="noreferrer">
            {block.props.label}
            <Icon name="external-link" size={14} />
          </a>
        </div>
      );
    default:
      return null;
  }
}
