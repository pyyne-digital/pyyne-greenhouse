"use client";

import React from "react";
import { ICON_NAMES, Icon } from "@playbook/index";
import { ui } from "@/styles/ui";

const fieldLabel = "block text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-1";
const inputSm =
  "w-full px-3 py-2 bg-paper/50 border border-border rounded-lg text-[13px] focus:border-forest/50 focus:ring-2 focus:ring-forest/10 outline-none transition-all";
export const iconBtn =
  "bg-white border border-border rounded-md cursor-pointer px-2 py-1 text-[11px] text-muted hover:bg-moss/40 hover:text-ink transition-colors";
export const listRow = "flex gap-1.5 mb-1.5 items-start";

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
    <label className="block mb-3">
      <span className={fieldLabel}>{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputSm} />
      ) : (
        <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputSm} />
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
    <label className="block mb-3">
      <span className={fieldLabel}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputSm}>
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
    <label className="block mb-3">
      <span className={fieldLabel}>{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-muted flex">
          <Icon name={value} size={18} />
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputSm}>
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
    <div className="flex items-center gap-2 mb-2">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#4b6332"}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border border-border rounded cursor-pointer bg-white"
      />
      <div className="flex-1">
        <div className="text-xs font-semibold text-ink">{label}</div>
        <code className="text-[10px] text-muted">{value}</code>
      </div>
    </div>
  );
}

/** String list editor (add/remove/edit/reorder). */
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
    <fieldset className="mb-3">
      <span className={fieldLabel}>{label}</span>
      {items.map((item, i) => (
        <div className="flex gap-1.5 mb-1.5 items-start" key={i}>
          {multiline ? (
            <textarea rows={2} value={item} onChange={(e) => set(i, e.target.value)} className={`${inputSm} flex-1`} />
          ) : (
            <input type="text" value={item} onChange={(e) => set(i, e.target.value)} className={`${inputSm} flex-1`} />
          )}
          <span className="flex flex-col gap-1">
            <button type="button" className={iconBtn} onClick={() => move(i, -1)} title="Move up">
              ↑
            </button>
            <button type="button" className={iconBtn} onClick={() => move(i, 1)} title="Move down">
              ↓
            </button>
            <button type="button" className={iconBtn} onClick={() => remove(i)} title="Remove">
              ✕
            </button>
          </span>
        </div>
      ))}
      <button type="button" className={iconBtn} onClick={() => onChange([...items, ""])}>
        + Add item
      </button>
    </fieldset>
  );
}
