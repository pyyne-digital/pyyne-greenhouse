import { notFound } from "next/navigation";
import { getPlaybook } from "@/lib/content";
import { PreviewClient } from "./PreviewClient";

export const dynamic = "force-dynamic";

export default async function PlaybookPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) notFound();

  return <PreviewClient playbook={playbook} />;
}
