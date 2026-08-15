import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gh-login">
      <div className="gh-login-card">
        <div className="gh-login-logo">🌱</div>
        <h1>Nada plantado aqui</h1>
        <p>A página que você procura não existe (ou ainda não foi aprovada).</p>
        <Link href="/" role="button">
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
