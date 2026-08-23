import { signIn } from "@/lib/auth";
import { getSession, isAuthBypassed } from "@/lib/session";
import { redirect } from "next/navigation";
import { PyyneLogo } from "@/components/brand/PyyneLogo";
import { standalone as st } from "@/styles/standalone";

function GoogleMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M19.602 10.223c0-.652-.058-1.28-.166-1.884H10v3.562h5.382a4.6 4.6 0 0 1-1.996 3.017v2.51h3.232c1.892-1.742 2.986-4.307 2.986-7.205z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.963-.897 6.617-2.43l-3.232-2.51c-.897.6-2.046.955-3.385.955-2.605 0-4.81-1.76-5.596-4.123H1.087v2.593A9.997 9.997 0 0 0 10 20z"
        fill="#34A853"
      />
      <path
        d="M4.404 11.892A5.996 5.996 0 0 1 4.076 10c0-.658.113-1.3.328-1.892V5.515H1.087A9.997 9.997 0 0 0 0 10c0 1.63.393 3.17 1.087 4.485l3.317-2.593z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.975c1.468 0 2.786.505 3.822 1.494l2.867-2.867C14.96 1.19 12.7 0 10 0 6.133 0 2.83 2.221 1.087 5.515l3.317 2.593c.786-2.363 2.991-4.133 5.596-4.133z"
        fill="#EA4335"
      />
    </svg>
  );
}

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
    <div className={st.page}>
      <div className={st.columnNarrow}>
        <div className={st.loginCard}>
          <div className="space-y-6">
            <PyyneLogo className={st.loginLogo} />
            <div className="space-y-2">
              <h1 className={st.loginTitle}>Greenhouse</h1>
              <p className={st.loginSub}>Nurturing institutional knowledge.</p>
            </div>
          </div>

          <div className={st.loginDivider} />

          <div className="space-y-10">
            <p className={st.loginPitch}>Access the living process guides that power Pyyne Digital.</p>
            {params.error ? (
              <p className="text-red-600 text-sm">
                Access denied. Use a Google account from the pyyne.com domain.
              </p>
            ) : null}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: params.callbackUrl ?? "/" });
              }}
            >
              <button type="submit" className={st.googleBtn}>
                <GoogleMark />
                <span className="uppercase tracking-widest text-xs">Sign in with Google</span>
              </button>
            </form>
          </div>

          <div className={st.loginFooter}>
            <p className={st.loginFooterNote}>Internal Tool • Pyyne Digital</p>
          </div>
        </div>

        <div className={st.statusRow}>
          <span className={st.statusDot} />
          <span className={st.statusText}>All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
