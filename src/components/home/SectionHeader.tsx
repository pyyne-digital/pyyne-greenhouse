import React from "react";
import { home } from "@/styles/home";

export function SectionHeader({ title, aside }: { title: string; aside?: string }) {
  return (
    <div className={home.sectionHeader}>
      <h2 className={home.sectionTitle}>{title}</h2>
      <div className={home.sectionRule} />
      {aside ? <p className={home.sectionAside}>{aside}</p> : null}
    </div>
  );
}
