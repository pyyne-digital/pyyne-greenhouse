import { NextResponse } from "next/server";
import { diffPlaybooks } from "@playbook/index";
import { requireUser } from "@/lib/guards";
import { getProposal } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const { n } = await params;
  const proposal = await getProposal(Number(n));
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (!proposal.after) {
    return NextResponse.json({ error: "Proposal content not found on the branch" }, { status: 500 });
  }

  const diff = diffPlaybooks(proposal.before, proposal.after);
  return NextResponse.json({
    number: proposal.number,
    url: proposal.url,
    state: proposal.state,
    merged: proposal.merged,
    meta: proposal.meta,
    before: proposal.before,
    after: proposal.after,
    diff,
  });
}
