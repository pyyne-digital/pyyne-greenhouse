import type { Playbook } from "@playbook/index";
import { getOctokit, hasGithubAppConfig, REPO_NAME, REPO_OWNER } from "./github";
import { decodeMeta } from "./proposals";
import { playbookPath } from "./content";

export interface HistoryEntry {
  kind: "proposal" | "version";
  status: "in-review" | "published" | "rejected" | "archived";
  title: string;
  summary: string;
  author: string;
  avatar?: string;
  date: string;
  /** PR number (proposal entries) */
  number?: number;
  /** Merge commit sha — enables snapshot view (published entries) */
  mergeSha?: string;
  /** Version label for changelog-derived entries */
  versionLabel?: string;
}

/**
 * Version history of a playbook. With the GitHub App configured, this is the
 * list of greenhouse PRs touching the playbook file. Locally, it falls back
 * to the playbook's own changelog block entries.
 */
export async function getVersionHistory(slug: string, playbook: Playbook): Promise<HistoryEntry[]> {
  if (!hasGithubAppConfig()) return fromChangelog(playbook);

  const octokit = await getOctokit();
  const { data: prs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: "all",
    per_page: 100,
  });

  const entries: HistoryEntry[] = [];
  for (const pr of prs) {
    const meta = decodeMeta(pr.body);
    if (!meta || meta.playbook !== slug) continue;
    entries.push({
      kind: "proposal",
      status: pr.merged_at ? "published" : pr.state === "open" ? "in-review" : "rejected",
      title: meta.type === "create" ? `New playbook: ${meta.playbookTitle}` : meta.summary,
      summary: meta.summary,
      author: meta.author.name,
      avatar: meta.author.avatar,
      date: pr.merged_at ?? pr.created_at,
      number: pr.number,
      mergeSha: pr.merge_commit_sha ?? undefined,
    });
  }
  return entries.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function fromChangelog(playbook: Playbook): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const page of playbook.pages) {
    for (const block of page.blocks) {
      if (block.type !== "changelog") continue;
      for (const e of block.props.entries) {
        entries.push({
          kind: "version",
          status: "published",
          title: e.typeLabel,
          summary: e.changes[0] ?? "",
          author: "Pyyne team",
          date: e.date,
          versionLabel: e.version,
        });
      }
    }
  }
  return entries;
}

/** Fetch the playbook content at a specific commit (snapshot). */
export async function getPlaybookAtCommit(slug: string, sha: string): Promise<Playbook | null> {
  if (!hasGithubAppConfig()) return null;
  const octokit = await getOctokit();
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: playbookPath(slug),
      ref: sha,
    });
    if (Array.isArray(data) || data.type !== "file") return null;
    const { PlaybookSchema } = await import("@playbook/index");
    return PlaybookSchema.parse(JSON.parse(Buffer.from(data.content, "base64").toString("utf8")));
  } catch {
    return null;
  }
}
