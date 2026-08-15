import { signIn } from "@/lib/auth";
import { getSession, isAuthBypassed } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  // Auth bypass active: no login screen, straight to the app.
  if (isAuthBypassed()) redirect(params.callbackUrl ?? "/");

  const session = await getSession();
  if (session?.user) redirect(params.callbackUrl ?? "/");

  return (
    <div className="gh-login">
      <div className="gh-login-card">
        <div className="gh-login-logo">🌱</div>
        <h1>Pyyne Greenhouse</h1>
        <p>
          Where ideas are planted, matured, and grown into playbooks. Sign in with your{" "}
          <strong>@pyyne.com</strong> Google account.
        </p>
        {params.error ? (
          <p style={{ color: "#A32D2D", fontSize: 13 }}>
            Access denied. Use a Google account from the pyyne.com domain.
          </p>
        ) : null}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: params.callbackUrl ?? "/" });
          }}
        >
          <button type="submit" style={{ width: "100%" }}>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
