import React from "react";
import Link from "next/link";
import type { Playbook } from "@playbook/index";
import { PyyneLogo } from "../brand/PyyneLogo";
import { PhIcon } from "../Icon";
import { home } from "@/styles/home";

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const { meta } = playbook;
  return (
    <Link href={`/playbooks/${meta.slug}`} className="block">
      <article className={home.playbookCard}>
        <div className={home.playbookHero}>
          <div className="absolute top-6 right-6">
            <span className={home.playbookVersion}>{meta.version}</span>
          </div>
          <PyyneLogo watermark className="absolute -right-8 -bottom-8 w-[200px] h-[200px] opacity-[0.07]" />
          <h3 className={home.playbookTitle}>{meta.title}</h3>
        </div>
        <div className={home.playbookBody}>
          <div className={home.playbookTagRow}>
            <span className={home.playbookOfficial}>Official</span>
            {meta.tags.slice(0, 1).map((t) => (
              <span key={t} className={home.playbookTag}>
                {t}
              </span>
            ))}
          </div>
          <p className={home.playbookDesc}>{meta.description}</p>
          <div className={home.playbookFooter}>
            <span className={home.playbookUpdated}>Updated {meta.lastUpdated}</span>
            <span className={home.playbookOpen}>
              Open <PhIcon name="arrow-right" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
