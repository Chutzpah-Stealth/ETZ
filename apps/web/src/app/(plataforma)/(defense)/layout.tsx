"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signOut, getToken } from "../../../lib/auth";
import type { DefenseRole } from "../../../lib/defense-guard";

const DEFENSE_ROLES: DefenseRole[] = ["gestor", "analista", "agente_campo"];

const ROLE_LABEL: Record<DefenseRole, string> = {
  gestor:       "GESTOR",
  analista:     "ANALISTA",
  agente_campo: "AGENTE DE CAMPO",
};

function IconDashboard() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9"/>
      <rect x="14" y="3" width="7" height="5"/>
      <rect x="14" y="12" width="7" height="9"/>
      <rect x="3" y="16" width="7" height="5"/>
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function IconFolderSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 2h1"/>
      <circle cx="17" cy="17" r="3"/>
      <path d="m21 21-1.5-1.5"/>
    </svg>
  );
}

function IconRadio() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
    </svg>
  );
}

function IconFileText() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const NAV: { href: string; label: string; icon: () => React.ReactElement; countKey?: "alvos" | "casos" | "qtc" | "relatorios" }[] = [
  { href: "/dashboard",  label: "Visão Geral", icon: IconDashboard },
  { href: "/alvos",      label: "Alvos",       icon: IconTarget,       countKey: "alvos" },
  { href: "/casos",      label: "Casos",       icon: IconFolderSearch, countKey: "casos" },
  { href: "/qtc",        label: "QTC",         icon: IconRadio,        countKey: "qtc"   },
  { href: "/relatorios", label: "Relatórios",  icon: IconFileText,     countKey: "relatorios" },
];

export default function DefenseLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady]             = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole]               = useState<DefenseRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [counts, setCounts] = useState<{ alvos: number | null; casos: number | null; qtc: number | null; relatorios: number | null }>({ alvos: null, casos: null, qtc: null, relatorios: null });

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) { router.replace("/login"); return; }

      const data = snap.data();
      const userRole = data?.role as string;

      if (userRole === "superadmin") { router.replace("/admin"); return; }
      if (!DEFENSE_ROLES.includes(userRole as DefenseRole)) { router.replace("/login"); return; }
      if (data?.status === "revoked") { await signOut(); router.replace("/login"); return; }

      setRole(userRole as DefenseRole);
      setDisplayName(data?.displayName || user.email || "");
      setSidebarOpen(window.innerWidth >= 1024);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

  // Contagem de alvos e casos da unidade via agregação count() (~2 leituras) — recarrega ao navegar
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/defense/counts", { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled || !res.ok) return;
        const data = await res.json() as { alvos: number; casos: number; qtc: number; relatorios: number };
        setCounts({ alvos: data.alvos, casos: data.casos, qtc: data.qtc, relatorios: data.relatorios });
      } catch { /* mantém contagem anterior */ }
    })();
    return () => { cancelled = true; };
  }, [ready, pathname]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--canvas)" }}>

      {/* Topbar */}
      <header className="defense-topbar">
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-600)", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 6, borderRadius: "var(--r-md)",
            flexShrink: 0, transition: "background var(--transition), color var(--transition)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--ink-900)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--ink-600)"; }}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <IconX /> : <IconMenu />}
        </button>

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <ETZLogoMark size={22} />
          <span style={{
            fontSize: 15, fontWeight: 700,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
            color: "var(--accent)",
          }}>ETZ</span>
          <span style={{
            fontSize: 10, fontWeight: 500,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            color: "var(--ink-400)",
            textTransform: "uppercase",
          }}>Defense</span>
        </div>

        {/* Role pill — mono uppercase */}
        {role && (
          <span className="defense-role-pill" style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            color: "var(--ink-500)",
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-full)",
            padding: "3px 10px",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}>
            {ROLE_LABEL[role]}
          </span>
        )}
      </header>

      {/* Overlay */}
      <div
        className={`defense-drawer-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`defense-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* User info */}
        <div style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--line)",
        }}>
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--font-ui)",
            color: "var(--ink-800)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {displayName}
          </p>
        </div>

        <nav style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map(({ href, label, icon: Icon, countKey }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const count  = countKey ? counts[countKey] : null;
            return (
              <Link
                key={href}
                href={href}
                className={`defense-nav-link${active ? " active" : ""}`}
              >
                <Icon />
                <span style={{ flex: 1 }}>{label}</span>
                {countKey && count !== null && <span className="nav-count">{count}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
          <button onClick={handleSignOut} className="defense-nav-link">
            <IconLogOut />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`defense-main${sidebarOpen ? " open" : ""}`}>
        {children}
      </main>
    </div>
  );
}
