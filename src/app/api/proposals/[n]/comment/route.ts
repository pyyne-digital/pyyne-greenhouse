import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/guards";
import { addComment } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

const CommentSchema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: Request, { params }: { params: Promise<{ n: string }> }) {
  const session = await requireUser();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!hasGithubAppConfig()) {
    return NextResponse.json({ error: "GitHub App not configured on the server" }, { status: 503 });
  }

  const body = CommentSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  const { n } = await params;
  const name = session.user.name ?? session.user.email;
  try {
    await addComment(Number(n), `**${name}** (via Greenhouse):\n\n${body.data.body}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to post comment" },
      { status: 500 }
    );
  }
}
