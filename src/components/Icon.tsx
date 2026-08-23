import React from "react";

/** Phosphor icon (regular weight). Usage: <PhIcon name="plus-circle" /> */
export function PhIcon({ name, className = "" }: { name: string; className?: string }) {
  return <i className={`ph ph-${name} ${className}`} aria-hidden="true" />;
}
