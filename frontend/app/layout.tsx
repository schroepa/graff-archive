import type { Metadata } from "next";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";

export const metadata: Metadata = {
  title: "Streetfiles – Graffiti Archive",
  description:
    "Autonomes Archiv der Writing-Kultur. Kein Like-System. Keine Algorithmen. Volle Datensouveränität.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" style={{ background: "var(--bg)" }} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text-primary)" }}
      >
        <NavigationBar />
        <main className="flex-1">{children}</main>
        <footer
          style={{
            borderTop: "1px solid var(--bg-border)",
            fontFamily: "var(--font-mono)",
            color: "var(--text-dim)",
            fontSize: "10px",
          }}
          className="px-4 py-6 text-center uppercase tracking-widest"
        >
          STREETFILES · Archivarische Autonomie · Kein Social Network
        </footer>
      </body>
    </html>
  );
}
