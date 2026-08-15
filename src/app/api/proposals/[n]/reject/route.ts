import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/guards";
import { getProposal, rejectProposal } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

const RejectSchema = z.object({ reason: z.string().min(4).max(500) });

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  const session = await requireAdmin();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Only admins can reject" }, { status: 403 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const body = RejectSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "Please provide a rejection reason (min. 4 characters)" }, { status: 400 });
  }

  const { n } = await params;
  const proposal = await getProposal(Number(n));
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (proposal.state !== "open") {
    return NextResponse.json({ error: "Proposal is already closed or merged" }, { status: 409 });
  }

  try {
    await rejectProposal(proposal.number, session.user.email, body.data.reason);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("rejectProposal failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reject" },
      { status: 500 }
    );
  }
}
