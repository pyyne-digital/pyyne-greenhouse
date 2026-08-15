"use client";

import React from "react";
import { ICON_NAMES, Icon } from "@playbook/index";

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function IconField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6b6b68", display: "flex" }}>
          <Icon name={value} size={18} />
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }}>
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="gh-color-field">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#679747"}
        onChange={(e) => onChange(e.target.value)}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#3a3a38" }}>{label}</div>
        <code>{value}</code>
      </div>
    </div>
  );
}

/** Editor de lista de strings (add/remove/edit/reorder). */
export function StringListField({
  label,
  items,
  onChange,
  multiline = true,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
}) {
  const set = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <fieldset style={{ border: "none", padding: 0 }}>
      <label>{label}</label>
      {items.map((item, i) => (
        <div className="gh-field-list-item" key={i}>
          {multiline ? (
            <textarea rows={2} value={item} onChange={(e) => set(i, e.target.value)} />
          ) : (
            <input type="text" value={item} onChange={(e) => set(i, e.target.value)} style={{ flex: 1 }} />
          )}
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <button type="button" className="gh-icon-btn" onClick={() => move(i, -1)} title="Mover para cima">
              ↑
            </button>
            <button type="button" className="gh-icon-btn" onClick={() => move(i, 1)} title="Mover para baixo">
              ↓
            </button>
            <button type="button" className="gh-icon-btn" onClick={() => remove(i)} title="Remover">
              ✕
            </button>
          </span>
        </div>
      ))}
      <button type="button" className="gh-icon-btn" onClick={() => onChange([...items, ""])}>
        + Adicionar item
      </button>
    </fieldset>
  );
}
