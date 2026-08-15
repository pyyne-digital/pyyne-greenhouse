import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gh-login">
      <div className="gh-login-card">
        <div className="gh-login-logo">🌱</div>
        <h1>Nothing planted here</h1>
        <p>The page you are looking for does not exist (or has not been approved yet).</p>
        <Link href="/" role="button">
          Back to home
        </Link>
      </div>
    </div>
  );
}
