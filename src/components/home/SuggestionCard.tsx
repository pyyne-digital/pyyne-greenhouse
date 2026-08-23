import React from "react";
import Link from "next/link";
import { PhIcon } from "../Icon";
import { home } from "@/styles/home";

export interface Suggestion {
  emoji: string;
  title: string;
  description: string;
}

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const { emoji, title, description } = suggestion;
  const href = `/new?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;

  return (
    <Link href={href} className="block">
      <div className={home.suggestionCard}>
        <div className={home.suggestionEmoji}>{emoji}</div>
        <h3 className={home.suggestionTitle}>{title}</h3>
        <p className={home.suggestionDesc}>{description}</p>
        <span className={home.suggestionCta}>
          Draft This <PhIcon name="plus" />
        </span>
      </div>
    </Link>
  );
}
