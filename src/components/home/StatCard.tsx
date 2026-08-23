import React from "react";
import { PhIcon } from "../Icon";
import { home } from "@/styles/home";

export function StatCard({
  label,
  value,
  icon,
  tone = "green",
}: {
  label: string;
  value: number | string;
  icon: string;
  tone?: "green" | "blue";
}) {
  const iconTone = tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-moss text-forest";
  return (
    <div className={home.statCard}>
      <div>
        <p className={home.statLabel}>{label}</p>
        <p className={home.statValue}>{value}</p>
      </div>
      <div className={`${home.statIconBox} ${iconTone}`}>
        <PhIcon name={icon} />
      </div>
    </div>
  );
}
