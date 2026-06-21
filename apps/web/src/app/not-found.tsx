import Link from "next/link";
import { ETZLogoMark } from "./components/ETZLogo";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--canvas)",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 20,
      }}>
        <ETZLogoMark size={40} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-400)",
          }}>
            Erro 404
          </p>
          <h1 style={{
            fontSize: "clamp(22px, 6vw, 28px)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            letterSpacing: "-0.018em",
            color: "var(--ink-900)",
          }}>
            Página não encontrada
          </h1>
          <p style={{
            fontSize: 14,
            fontFamily: "var(--font-ui)",
            color: "var(--ink-500)",
            lineHeight: 1.6,
          }}>
            O endereço acessado não existe ou foi movido. Verifique o link ou volte para uma área válida.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" className="btn-primary btn-primary--sm">Ir para o início</Link>
          <Link href="/login" className="btn-secondary btn-primary--sm">Acessar a plataforma</Link>
        </div>
      </div>
    </main>
  );
}
