import React from "react";

/**
 * Renders the small inline HTML subset allowed in playbook text:
 * <strong>, <b>, <em>, <i>. Everything else is escaped as plain text.
 */
export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  const re = /<(strong|b|em|i)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const inner = m[2];
    if (m[1] === "strong" || m[1] === "b") nodes.push(<strong key={key++}>{inner}</strong>);
    else nodes.push(<em key={key++}>{inner}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
