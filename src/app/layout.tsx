import type { Metadata } from "next";
import "@picocss/pico/css/pico.min.css";
import "@playbook/playbook.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pyyne Greenhouse",
    description: "Where Pyyne playbooks are planted, matured, and grown.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
