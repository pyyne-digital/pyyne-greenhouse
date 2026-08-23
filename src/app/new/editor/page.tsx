import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { NewPlaybookEditor } from "./NewPlaybookEditor";

export const dynamic = "force-dynamic";

export default async function NewPlaybookEditorPage() {
  const session = await requireUser();
  if (!session) redirect("/login");

  return (
    <Suspense>
      <NewPlaybookEditor author={session.user!.email!} />
    </Suspense>
  );
}
