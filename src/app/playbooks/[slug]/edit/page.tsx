import { notFound, redirect } from "next/navigation";
import { getPlaybook } from "@/lib/content";
import { requireUser } from "@/lib/guards";
import { EditorClient } from "./EditorClient";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireUser();
  if (!session) redirect("/login");

  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) notFound();

  return <EditorClient playbook={playbook} author={session.user!.email!} />;
}
