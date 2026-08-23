import { PlaybookSchema, type Playbook, type ProposalMeta } from "@playbook/index";
import { getOctokit, REPO_NAME, REPO_OWNER } from "./github";
import { playbookPath } from "./content";

const LABEL = "greenhouse";
const META_RE = /<!--\s*greenhouse\s*([\s\S]*?)\s*-->/;

export function encodeMeta(meta: ProposalMeta): string {
  return `<!-- greenhouse\n${JSON.stringify(meta, null, 2)}\n-->`;
}

export function decodeMeta(body: string | null | undefined): ProposalMeta | null {
  if (!body) return null;
  const m = META_RE.exec(body);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as ProposalMeta;
  } catch {
    return null;
  }
}

export interface ProposalSummary {
  number: number;
  url: string;
  meta: ProposalMeta;
}

export async function ensureLabel(octokit: Awaited<ReturnType<typeof getOctokit>>) {
  try {
    await octokit.issues.getLabel({ owner: REPO_OWNER, repo: REPO_NAME, name: LABEL });
  } catch {
    await octokit.issues.createLabel({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      name: LABEL,
      color: "679747",
      description: "Change proposal created by Pyyne Greenhouse",
    });
  }
}

export async function createProposal(input: {
  content: Playbook;
  meta: ProposalMeta;
}): Promise<{ number: number; url: string }> {
  const octokit = await getOctokit();
  const { content, meta } = input;
  const slug = meta.playbook;
  const path = playbookPath(slug);

  const { data: ref } = await octokit.git.getRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: "heads/main",
  });
  const baseSha = ref.object.sha;

  const branch = `proposal/${slug}-${Date.now().toString(36)}`;
  await octokit.git.createRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  let existingSha: string | undefined;
  if (meta.type === "edit") {
    try {
      const { data } = await octokit.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path, ref: "main" });
      if (!Array.isArray(data) && data.type === "file") existingSha = data.sha;
    } catch {
      /* file may not exist */
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    branch,
    message:
      meta.type === "create"
        ? `feat(playbook): new playbook "${meta.playbookTitle}" via Greenhouse`
        : `feat(playbook): update "${meta.playbookTitle}" via Greenhouse`,
    content: Buffer.from(JSON.stringify(PlaybookSchema.parse(content), null, 2) + "\n").toString("base64"),
    ...(existingSha ? { sha: existingSha } : {}),
  });

  await ensureLabel(octokit);

  const titlePrefix = meta.type === "create" ? "[greenhouse] New playbook" : "[greenhouse]";
  const { data: pr } = await octokit.pulls.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title: `${titlePrefix}: ${meta.playbookTitle} — ${meta.summary.slice(0, 72)}`,
    head: branch,
    base: "main",
    body: `${encodeMeta(meta)}\n\n## Greenhouse proposal\n\n**Author:** ${meta.author.name} (${meta.author.email})\n\n**Summary:** ${meta.summary}\n\n> Review the visual before/after at ${"/proposals"} in Greenhouse before approving.`,
  });

  await octokit.issues.addLabels({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: pr.number,
    labels: [LABEL],
  });

  return { number: pr.number, url: pr.html_url };
}

export async function listProposals(): Promise<ProposalSummary[]> {
  const octokit = await getOctokit();
  const { data: prs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: "open",
    per_page: 50,
  });
  return prs
    .filter((pr) => pr.labels.some((l) => l.name === LABEL))
    .map((pr) => ({ number: pr.number, url: pr.html_url, meta: decodeMeta(pr.body) }))
    .filter((p): p is ProposalSummary & { meta: ProposalMeta } => p.meta !== null);
}

export async function getProposal(number: number) {
  const octokit = await getOctokit();
  const { data: pr } = await octokit.pulls.get({ owner: REPO_OWNER, repo: REPO_NAME, pull_number: number });
  const meta = decodeMeta(pr.body);
  if (!meta) return null;

  async function fileAt(ref: string): Promise<Playbook | null> {
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: playbookPath(meta!.playbook),
        ref,
      });
      if (Array.isArray(data) || data.type !== "file") return null;
      return PlaybookSchema.parse(JSON.parse(Buffer.from(data.content, "base64").toString("utf8")));
    } catch {
      return null;
    }
  }

  const [before, after] = await Promise.all([fileAt("main"), fileAt(pr.head.ref)]);
  return {
    number: pr.number,
    url: pr.html_url,
    state: pr.state,
    merged: pr.merged_at !== null,
    meta,
    before,
    after,
  };
}

export async function mergeProposal(number: number, approverEmail: string) {
  const octokit = await getOctokit();
  await octokit.pulls.merge({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: number,
    merge_method: "squash",
  });
  await octokit.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: number,
    body: `Approved and published by ${approverEmail} via Greenhouse.`,
  });
}

export interface ProposalComment {
  id: number;
  author: string;
  avatar?: string;
  body: string;
  createdAt: string;
}

export async function listComments(number: number): Promise<ProposalComment[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.issues.listComments({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: number,
    per_page: 100,
  });
  return data
    .filter((c) => !c.body?.startsWith("<!-- greenhouse"))
    .map((c) => ({
      id: c.id,
      author: c.user?.login ?? "unknown",
      avatar: c.user?.avatar_url,
      body: c.body ?? "",
      createdAt: c.created_at,
    }));
}

export async function addComment(number: number, body: string) {
  const octokit = await getOctokit();
  await octokit.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: number,
    body,
  });
}

export async function rejectProposal(number: number, approverEmail: string, reason: string) {
  const octokit = await getOctokit();
  await octokit.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: number,
    body: `Rejected by ${approverEmail} via Greenhouse.\n\n**Reason:** ${reason}`,
  });
  await octokit.pulls.update({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: number,
    state: "closed",
  });
}
