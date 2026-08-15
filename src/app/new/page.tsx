import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/guards";
import { NewPlaybookWizard } from "./NewPlaybookWizard";

export const dynamic = "force-dynamic";

export default async function NewPlaybookPage() {
  const session = await requireUser();
  if (!session) redirect("/login");

  return (
    <>
      <AppHeader />
      <main className="gh-container">
        <div className="gh-wizard">
          <h1 className="gh-page-title">New playbook</h1>
          <p className="gh-page-sub">
            Plant a new idea. It goes through the same approval flow as any change and, after the
            merge, gets its own site on GitHub Pages.
          </p>
          <NewPlaybookWizard />
        </div>
      </main>
    </>
  );
}
