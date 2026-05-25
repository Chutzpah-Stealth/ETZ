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
        background: "var(--paper-2)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Logo + marca */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <ETZLogoMark size={40} />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            ETZ
          </span>
        </div>

        {/* Card de login */}
        <div
          style={{
            background: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-xl)",
            padding: "36px 32px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              marginBottom: 6,
            }}
          >
            Acesso à Plataforma
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28, lineHeight: 1.5 }}>
            Use as credenciais fornecidas pelo administrador.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@instituicao.gov.br"
                style={{
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "var(--ink)",
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                  transition: "border-color var(--transition)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                Senha
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  padding: "11px 14px",
                  fontSize: 14,
                  color: "var(--ink)",
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                  transition: "border-color var(--transition)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#C0392B",
                  background: "#FDF2F1",
                  border: "1px solid #F5C6C2",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 8, width: "100%", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Acesso restrito a usuários autorizados.
          <br />
          Em caso de problemas, contate o administrador da sua instituição.
        </p>
      </div>
    </main>
  );
}
