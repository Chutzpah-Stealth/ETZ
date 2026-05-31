import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--loaded-display",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--loaded-ui",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--loaded-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETZ — Plataforma de Inteligência",
  description:
    "ETZ é uma plataforma de inteligência estratégica para segurança pública e defesa nacional.",
  keywords: ["inteligência", "segurança pública", "inteligência operacional", "análise de dados"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      style={{
        "--font-display": "var(--loaded-display), 'Space Grotesk', system-ui, sans-serif",
        "--font-ui":      "var(--loaded-ui), 'IBM Plex Sans', system-ui, sans-serif",
        "--font-mono":    "var(--loaded-mono), 'IBM Plex Mono', 'Courier New', monospace",
      } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
