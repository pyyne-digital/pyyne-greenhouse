import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/guards";
import { getPlaybook } from "@/lib/content";
import { getVersionHistory } from "@/lib/history";
import { listProposals } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";
import { HistoryView } from "./HistoryView";

export const dynamic = "force-dynamic";

export default async function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireUser();
  if (!session) redirect("/login");

  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) notFound();

  const [entries, proposalsCount] = await Promise.all([
    getVersionHistory(slug, playbook),
    hasGithubAppConfig()
      ? listProposals().then((p) => p.length).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);

  return (
    <AppShell proposalsCount={proposalsCount}>
      <HistoryView playbook={playbook} entries={entries} />
    </AppShell>
  );
}
