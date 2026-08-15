import { NextResponse } from "next/server";
import { z } from "zod";
import { PlaybookSchema, type ProposalMeta } from "@playbook/index";
import { requireUser } from "@/lib/guards";
import { createProposal, listProposals } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const proposals = await listProposals();
  return NextResponse.json({ proposals });
}

const CreateSchema = z.object({
  type: z.enum(["edit", "create"]),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.unknown(),
  summary: z.string().min(4).max(500),
});

export async function POST(req: Request) {
  const session = await requireUser();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const body = CreateSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", details: body.error.flatten() }, { status: 400 });
  }

  const parsed = PlaybookSchema.safeParse(body.data.content);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Content does not match the schema", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  if (parsed.data.meta.slug !== body.data.slug) {
    return NextResponse.json({ error: "Content slug differs from payload slug" }, { status: 400 });
  }

  const meta: ProposalMeta = {
    type: body.data.type,
    playbook: body.data.slug,
    playbookTitle: parsed.data.meta.title,
    author: {
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      avatar: session.user.image ?? undefined,
    },
    summary: body.data.summary,
    createdAt: new Date().toISOString(),
  };

  try {
    const pr = await createProposal({ content: parsed.data, meta });
    return NextResponse.json({ number: pr.number, url: pr.url });
  } catch (e) {
    console.error("createProposal failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create proposal" },
      { status: 500 }
    );
  }
}
