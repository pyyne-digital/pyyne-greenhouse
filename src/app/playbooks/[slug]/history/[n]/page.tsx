import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { getPlaybook } from "@/lib/content";
import { getPlaybookAtCommit } from "@/lib/history";
import { getOctokit, hasGithubAppConfig, REPO_NAME, REPO_OWNER } from "@/lib/github";
import { decodeMeta } from "@/lib/proposals";
import { VersionDetailView } from "./VersionDetailView";

export const dynamic = "force-dynamic";

export default async function VersionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const session = await requireUser();
  if (!session) redirect("/login");

  const { slug, n } = await params;
  if (!hasGithubAppConfig()) notFound();

  const octokit = await getOctokit();
  const { data: pr } = await octokit.pulls
    .get({ owner: REPO_OWNER, repo: REPO_NAME, pull_number: Number(n) })
    .catch(() => ({ data: null }));
  if (!pr) notFound();

  const meta = decodeMeta(pr.body);
  if (!meta || meta.playbook !== slug) notFound();

  // Open proposals are reviewed in the proposal screen.
  if (pr.state === "open") redirect(`/proposals/${n}`);

  const snapshot = pr.merge_commit_sha ? await getPlaybookAtCommit(slug, pr.merge_commit_sha) : null;
  const current = await getPlaybook(slug);

  return (
    <VersionDetailView
      slug={slug}
      prNumber={pr.number}
      prUrl={pr.html_url}
      merged={pr.merged_at !== null}
      mergedAt={pr.merged_at}
      meta={meta}
      snapshot={snapshot}
      current={current}
    />
  );
}
