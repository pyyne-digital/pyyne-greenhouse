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
          <h1 className="gh-page-title">Novo playbook</h1>
          <p className="gh-page-sub">
            Plante uma nova ideia. Ela passa pela mesma aprovação de sempre e, depois do merge, vira
            um site próprio no GitHub Pages.
          </p>
          <NewPlaybookWizard />
        </div>
      </main>
    </>
  );
}
