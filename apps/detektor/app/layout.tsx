import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import "./globals.css";
import { Header } from "./components/Header";
import { themeStyle } from "./lib/design";

export const metadata: Metadata = {
  title: "Der Agent-Washing-Detektor",
  description:
    "Prüft, ob ein Prozess agentische Automatisierung braucht, ob ein System ein echter Agent ist und welcher Preis gerechtfertigt ist.",
};

// Setzt das gespeicherte Theme vor dem ersten Paint (verhindert Flackern).
const themeInit = `(function(){try{var t=localStorage.getItem('awd-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <style dangerouslySetInnerHTML={{ __html: themeStyle() }} />
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
