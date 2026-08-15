import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { canSelfApprove } from "@/lib/admins";
import { getProposal, mergeProposal } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const session = await requireAdmin();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Only admins can approve" }, { status: 403 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const { n } = await params;
  const proposal = await getProposal(Number(n));
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (proposal.state !== "open") {
    return NextResponse.json({ error: "Proposal is already closed or merged" }, { status: 409 });
  }

  const approver = session.user.email;
  const author = proposal.meta.author.email;
  if (approver.toLowerCase() === author.toLowerCase() && !canSelfApprove(approver)) {
    return NextResponse.json(
      { error: "An admin cannot approve their own proposal. Another admin must review it." },
      { status: 403 }
    );
  }

  try {
    await mergeProposal(proposal.number, approver);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mergeProposal failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to approve" },
      { status: 500 }
    );
  }
}
