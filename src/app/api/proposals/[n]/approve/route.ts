import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { canSelfApprove } from "@/lib/admins";
import { getProposal, mergeProposal } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const session = await requireAdmin();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Apenas admins podem aprovar" }, { status: 403 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App não configurado no servidor" }, { status: 503 });
  }

  const { n } = await params;
  const proposal = await getProposal(Number(n));
  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  if (proposal.state !== "open") {
    return NextResponse.json({ error: "Proposta já foi fechada ou mergeada" }, { status: 409 });
  }

  const approver = session.user.email;
  const author = proposal.meta.author.email;
  if (approver.toLowerCase() === author.toLowerCase() && !canSelfApprove(approver)) {
    return NextResponse.json(
      { error: "Um admin não pode aprovar a própria proposta. Outro admin precisa revisar." },
      { status: 403 }
    );
  }

  try {
    await mergeProposal(proposal.number, approver);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mergeProposal failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao aprovar" },
      { status: 500 }
    );
  }
}
