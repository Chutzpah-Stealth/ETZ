"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signOut } from "../../../lib/auth";

const NAV = [
  { href: "/admin",              label: "Visão Geral" },
  { href: "/admin/usuarios",     label: "Usuários"    },
  { href: "/admin/instituicoes", label: "Instituições" },
  { href: "/admin/auditoria",    label: "Auditoria"   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data()?.role !== "superadmin") {
        router.replace("/dashboard");
        return;
      }
      setReady(true);
    });
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper-2)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "var(--paper)",
        borderRight: "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
      }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--rule)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ETZLogoMark size={20} />
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>ETZ</span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>
            Administração
          </p>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--ink)" : "var(--muted)",
                  background: active ? "var(--paper-2)" : "transparent",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  transition: "background var(--transition)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--rule)" }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 400,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius-md)",
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: 40, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
