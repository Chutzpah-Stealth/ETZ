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
  { href: "/admin",              label: "Visão Geral"  },
  { href: "/admin/usuarios",     label: "Usuários"     },
  { href: "/admin/instituicoes", label: "Instituições" },
  { href: "/admin/auditoria",    label: "Auditoria"    },
];

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady]             = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data()?.role !== "superadmin") {
        router.replace("/dashboard");
        return;
      }
      // Open sidebar by default on desktop
      setSidebarOpen(window.innerWidth >= 1024);
      setReady(true);
    });
  }, [router]);

  // Close sidebar on navigation when on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper-2)" }}>

      {/* Topbar — always visible, all screen sizes */}
      <header className="admin-topbar">
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            marginRight: 10,
            borderRadius: "var(--radius-md)",
            flexShrink: 0,
          }}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ETZLogoMark size={22} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>ETZ</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</span>
        </div>
      </header>

      {/* Overlay — fades in on mobile when sidebar is open */}
      <div
        className={`admin-drawer-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — always in DOM, slides via CSS transform, starts below topbar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  padding: "10px 14px",
                  fontSize: 14,
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

        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--rule)" }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              fontSize: 14,
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

      {/* Page content — shifts right on desktop when sidebar is open */}
      <main className={`admin-main${sidebarOpen ? " open" : ""}`}>
        {children}
      </main>
    </div>
  );
}
