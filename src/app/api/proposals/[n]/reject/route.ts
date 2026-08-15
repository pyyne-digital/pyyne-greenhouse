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
    return NextResponse.json({ error: "Apenas admins podem rejeitar" }, { status: 403 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App não configurado no servidor" }, { status: 503 });
  }

  const body = RejectSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "Informe o motivo da rejeição (mín. 4 caracteres)" }, { status: 400 });
  }

  const { n } = await params;
  const proposal = await getProposal(Number(n));
  if (!proposal) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  if (proposal.state !== "open") {
    return NextResponse.json({ error: "Proposta já foi fechada ou mergeada" }, { status: 409 });
  }

  try {
    await rejectProposal(proposal.number, session.user.email, body.data.reason);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("rejectProposal failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao rejeitar" },
      { status: 500 }
    );
  }
}
