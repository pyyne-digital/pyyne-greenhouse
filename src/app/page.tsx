import Link from "next/link";
import { listPlaybooks } from "@/lib/content";
import { AppHeader } from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const playbooks = await listPlaybooks();

  return (
    <>
      <AppHeader />
      <main className="gh-container">
        <h1 className="gh-page-title">Playbooks</h1>
        <p className="gh-page-sub">
          Living guides on how we work. Anyone @pyyne.com can suggest changes; admins approve and
          deployment is automatic.
        </p>

        {playbooks.length === 0 ? (
          <div className="gh-empty">
            <div className="gh-empty-icon">🌱</div>
            <h3>No playbooks yet</h3>
            <p>Plant the first idea: create a playbook and submit it for approval.</p>
            <Link href="/new" role="button">
              Create playbook
            </Link>
          </div>
        ) : (
          <div className="gh-pb-grid">
            {playbooks.map((p) => (
              <div key={p.meta.slug} className="gh-pb-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{p.meta.favicon}</span>
                  <code style={{ fontSize: 11, color: "#9a9a96" }}>{p.meta.version}</code>
                </div>
                <h3>{p.meta.title}</h3>
                <p>{p.meta.description}</p>
                <div className="gh-tags">
                  {p.meta.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="gh-pb-card-actions">
                  <Link href={`/playbooks/${p.meta.slug}`} role="button" className="outline">
                    View
                  </Link>
                  <Link href={`/playbooks/${p.meta.slug}/edit`} role="button">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
