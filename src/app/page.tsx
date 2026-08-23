import { listPlaybooks } from "@/lib/content";
import { listProposals } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";
import { AppShell } from "@/components/shell/AppShell";
import { StatCard } from "@/components/home/StatCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { PlaybookCard } from "@/components/home/PlaybookCard";
import { SuggestionCard, type Suggestion } from "@/components/home/SuggestionCard";
import { ui } from "@/styles/ui";
import { home } from "@/styles/home";
import type { Playbook } from "@playbook/index";

export const dynamic = "force-dynamic";

const SUGGESTIONS: Suggestion[] = [
  {
    emoji: "🎩",
    title: "Consultants Playbook",
    description: "Client etiquette, professional standards, and cause stellar first impressions.",
  },
  {
    emoji: "🤝",
    title: "Mentorship Playbook",
    description: "Guidelines for mentors and mentees to maximize growth loops at Pyyne.",
  },
  {
    emoji: "🪴",
    title: "Onboarding Someone",
    description: "A tactical guide for talent leads and mentors welcoming new members.",
  },
  {
    emoji: "👋",
    title: "Welcome to Pyyne!",
    description: "The essential first-read for newcomers. Culture, tools, and the Greenhouse way.",
  },
];

function countContributors(playbooks: Playbook[]): number {
  const authors = new Set<string>();
  for (const p of playbooks) {
    for (const page of p.pages) {
      for (const block of page.blocks) {
        if (block.type === "contributors") {
          for (const e of block.props.entries) {
            const name = e.author.trim();
            if (name) authors.add(name.toLowerCase());
          }
        }
      }
    }
  }
  return authors.size;
}

export default async function Home() {
  const playbooks = await listPlaybooks();
  const proposalsCount = hasGithubAppConfig()
    ? await listProposals()
        .then((p) => p.length)
        .catch(() => undefined)
    : undefined;

  return (
    <AppShell proposalsCount={proposalsCount}>
      <header className={home.header}>
        <h1 className={ui.pageHeading}>The Archive</h1>
        <p className={ui.pageSubheading}>
          Nurturing Pyyne&apos;s collective intelligence and operational standards.
        </p>
      </header>

      <div className={home.statsGrid}>
        <StatCard label="Active Playbooks" value={playbooks.length} icon="book-open" />
        <StatCard label="Total Contributors" value={countContributors(playbooks)} icon="users-three" tone="blue" />
      </div>

      <section className={home.section}>
        <SectionHeader title="Active Playbooks" />
        {playbooks.length === 0 ? (
          <p className={home.empty}>
            No playbooks yet — plant the first idea with “New Playbook”.
          </p>
        ) : (
          <div className={home.playbookGrid}>
            {playbooks.map((p) => (
              <PlaybookCard key={p.meta.slug} playbook={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Suggestions to Cultivate" aside="Next to standardise" />
        <div className={home.suggestionGrid}>
          {SUGGESTIONS.map((s) => (
            <SuggestionCard key={s.title} suggestion={s} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
