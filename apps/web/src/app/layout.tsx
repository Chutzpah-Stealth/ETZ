import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETZ — Plataforma de Inteligência",
  description:
    "ETZ é uma plataforma modular de inteligência de dados para segurança pública e o mercado corporativo.",
  keywords: ["inteligência", "segurança pública", "inteligência corporativa", "análise de dados", "prevenção de fraudes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
