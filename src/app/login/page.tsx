import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) redirect(params.callbackUrl ?? "/");

  return (
    <div className="gh-login">
      <div className="gh-login-card">
        <div className="gh-login-logo">🌱</div>
        <h1>Pyyne Greenhouse</h1>
        <p>
          Onde ideias são plantadas, maturadas e crescem até virarem playbooks. Entre com sua conta
          Google <strong>@pyyne.com</strong>.
        </p>
        {params.error ? (
          <p style={{ color: "#A32D2D", fontSize: 13 }}>
            Acesso negado. Use uma conta Google do domínio pyyne.com.
          </p>
        ) : null}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: params.callbackUrl ?? "/" });
          }}
        >
          <button type="submit" style={{ width: "100%" }}>
            Entrar com Google
          </button>
        </form>
      </div>
    </div>
  );
}
