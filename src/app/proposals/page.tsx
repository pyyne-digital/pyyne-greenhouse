import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/guards";
import { listProposals } from "@/lib/proposals";
import { hasGithubAppConfig } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const session = await requireUser();
  if (!session) redirect("/login");

  const configured = hasGithubAppConfig();
  const proposals = configured ? await listProposals().catch(() => []) : [];

  return (
    <>
      <AppHeader />
      <main className="gh-container">
        <h1 className="gh-page-title">Proposals</h1>
        <p className="gh-page-sub">
          Suggested changes waiting for review. Admins review the before/after and approve;
          deployment is automatic after the merge.
        </p>

        {!configured ? (
          <div className="gh-empty">
            <div className="gh-empty-icon">⚙️</div>
            <h3>GitHub App not configured</h3>
            <p>Set the GITHUB_APP_* variables on the server to enable proposals.</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="gh-empty">
            <div className="gh-empty-icon">🌿</div>
            <h3>No open proposals</h3>
            <p>When someone submits a change, it shows up here.</p>
          </div>
        ) : (
          proposals.map((p) => (
            <Link
              key={p.number}
              href={`/proposals/${p.number}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="gh-proposal-card">
                <div>
                  <h3>
                    {p.meta.type === "create" ? "New playbook: " : ""}
                    {p.meta.playbookTitle}
                    <span className={`gh-diff-tag ${p.meta.type === "create" ? "gh-diff-added" : "gh-diff-changed"}`}>
                      {p.meta.type === "create" ? "creation" : "edit"}
                    </span>
                  </h3>
                  <div className="gh-meta">
                    {p.meta.author.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.meta.author.avatar} alt="" referrerPolicy="no-referrer" />
                    ) : null}
                    {p.meta.author.name} · {new Date(p.meta.createdAt).toLocaleDateString("en-US")}
                  </div>
                  <div className="gh-meta" style={{ marginTop: 4 }}>{p.meta.summary}</div>
                </div>
                <span style={{ fontSize: 13, color: "#679747", whiteSpace: "nowrap" }}>Review →</span>
              </div>
            </Link>
          ))
        )}
      </main>
    </>
  );
}
