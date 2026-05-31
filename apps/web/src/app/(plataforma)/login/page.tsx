"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signIn } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch {
      setError("Credenciais inválidas ou acesso não autorizado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--canvas)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Logo + wordmark */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <ETZLogoMark size={36} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              color: "var(--accent)",
            }}>
              ETZ
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "var(--ink-400)",
              textTransform: "uppercase",
            }}>
              Defense
            </span>
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          padding: "32px 28px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <h1 style={{
            fontSize: 18,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            letterSpacing: "-0.012em",
            color: "var(--ink-900)",
            marginBottom: 4,
          }}>
            Acesso à Plataforma
          </h1>
          <p style={{
            fontSize: 13,
            fontFamily: "var(--font-ui)",
            color: "var(--ink-500)",
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            Use as credenciais fornecidas pelo administrador.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* E-mail */}
            <div className="form-field">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@instituicao.gov.br"
                className="form-input"
              />
            </div>

            {/* Senha */}
            <div className="form-field">
              <label className="form-label">Senha</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            {/* Erro */}
            {error && (
              <div style={{
                fontSize: 13,
                color: "var(--danger)",
                background: "var(--danger-tint)",
                border: "1px solid #f5c6c2",
                borderRadius: "var(--r-sm)",
                padding: "10px 14px",
                fontFamily: "var(--font-ui)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 4, width: "100%", opacity: loading ? 0.7 : 1, justifyContent: "center" }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p style={{
          fontSize: 12,
          fontFamily: "var(--font-ui)",
          color: "var(--ink-400)",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Acesso restrito a usuários autorizados.
          <br />
          Em caso de problemas, contate o administrador da sua instituição.
        </p>
      </div>
    </main>
  );
}
