import Link from "next/link";
import { PyyneLogo } from "@/components/brand/PyyneLogo";
import { standalone as st } from "@/styles/standalone";
import { ui } from "@/styles/ui";

export default function NotFound() {
  return (
    <div className={st.page}>
      <div className={st.columnNarrow}>
        <div className={st.formCard} style={{ textAlign: "center" }}>
          <PyyneLogo className="w-16 h-16 mx-auto mb-6" />
          <h1 className={st.brandTitle}>Nothing planted here</h1>
          <p className={st.brandSub} style={{ marginBottom: 24 }}>
            The page you are looking for does not exist (or has not been approved yet).
          </p>
          <Link href="/" className={`${ui.btnPrimary} inline-flex`}>
            Back to the Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
