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
          Guias vivos de como trabalhamos. Qualquer pessoa @pyyne.com pode sugerir mudanças;
          admins aprovam e o deploy é automático.
        </p>

        {playbooks.length === 0 ? (
          <div className="gh-empty">
            <div className="gh-empty-icon">🌱</div>
            <h3>Nenhum playbook ainda</h3>
            <p>Plante a primeira ideia: crie um playbook e submeta para aprovação.</p>
            <Link href="/new" role="button">
              Criar playbook
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
                    Visualizar
                  </Link>
                  <Link href={`/playbooks/${p.meta.slug}/edit`} role="button">
                    Editar
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
