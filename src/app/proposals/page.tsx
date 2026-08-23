import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { PhIcon } from "@/components/Icon";
import { requireUser } from "@/lib/guards";
import { getProposal, listProposals } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";
import { timeAgo } from "@/lib/time";
import { diffPlaybooks } from "@playbook/index";
import { ui } from "@/styles/ui";
import { proposals as pr } from "@/styles/proposals";

export const dynamic = "force-dynamic";

async function statsFor(number: number): Promise<{ changes: number; blocks: number } | null> {
  try {
    const proposal = await getProposal(number);
    if (!proposal?.after) return null;
    const diff = diffPlaybooks(proposal.before, proposal.after);
    let blocks = 0;
    let changes = diff.metaChanges.length + diff.themeChanges.length + (diff.navChanged ? 1 : 0);
    for (const pc of diff.pageChanges) {
      if (pc.kind === "changed") {
        blocks += pc.blockChanges.length;
        changes += pc.blockChanges.length + pc.fieldChanges.length;
      } else if (pc.kind !== "unchanged") {
        changes += 1;
      }
    }
    return { changes, blocks };
  } catch {
    return null;
  }
}

export default async function ProposalsPage() {
  const session = await requireUser();
  if (!session) redirect("/login");

  const configured = hasGithubAppConfig();
  const list = configured ? await listProposals().catch(() => []) : [];
  const stats = new Map((await Promise.all(list.map(async (p) => [p.number, await statsFor(p.number)] as const))));

  return (
    <AppShell proposalsCount={list.length}>
      <div className={pr.header}>
        <h1 className={ui.pageHeading}>Pending Proposals</h1>
        <p className={ui.pageSubheading}>Review and cultivate changes proposed by the team.</p>
      </div>

      {!configured ? (
        <p className={pr.cardSummary}>
          GitHub App not configured — set the GITHUB_APP_* variables on the server to enable proposals.
        </p>
      ) : list.length === 0 ? (
        <p className={pr.cardSummary}>No open proposals. When someone submits a change, it shows up here.</p>
      ) : (
        <div className={pr.list}>
          {list.map((p) => {
            const s = stats.get(p.number);
            return (
              <Link key={p.number} href={`/proposals/${p.number}`} className="block">
                <div className={pr.card}>
                  <div className={pr.avatarWrap}>
                    {p.meta.author.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.meta.author.avatar} className={pr.avatar} alt="Author" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`${pr.avatar} bg-moss flex items-center justify-center text-forest text-xl font-bold`}>
                        {p.meta.author.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`${pr.avatarIcon} ${p.meta.type === "create" ? "bg-purple-500" : "bg-blue-500"}`}
                    >
                      <PhIcon name={p.meta.type === "create" ? "sparkle" : "pen"} />
                    </div>
                  </div>
                  <div className={pr.cardBody}>
                    <div className={pr.cardAuthorRow}>
                      <span className={pr.cardAuthor}>{p.meta.author.name}</span>
                      <span className={pr.cardTime}>• {timeAgo(p.meta.createdAt)}</span>
                    </div>
                    <h3 className={pr.cardTitle}>
                      {p.meta.type === "create" ? `New playbook: ${p.meta.playbookTitle}` : p.meta.playbookTitle}
                    </h3>
                    <p className={pr.cardSummary}>{p.meta.summary}</p>
                  </div>
                  <div className={pr.cardRight}>
                    {s ? (
                      <div className={pr.cardStats}>
                        <div className={pr.cardStatMain}>+{s.changes} changes</div>
                        <div className={pr.cardStatSub}>{s.blocks} blocks</div>
                      </div>
                    ) : null}
                    <span className={pr.reviewBtn}>
                      Review <PhIcon name="arrow-right" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
