"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signOut } from "../../../lib/auth";
import type { DefenseRole } from "../../../lib/defense-guard";

const DEFENSE_ROLES: DefenseRole[] = ["gestor", "analista", "agente_campo"];

const ROLE_LABEL: Record<DefenseRole, string> = {
  gestor:       "GESTOR",
  analista:     "ANALISTA",
  agente_campo: "AGENTE DE CAMPO",
};

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

const NAV = [
  { href: "/alvos", label: "Alvos", icon: IconTarget },
  { href: "/casos", label: "Casos", icon: IconFolderSearch },
];

export default function DefenseLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady]             = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole]               = useState<DefenseRole | null>(null);
  const [displayName, setDisplayName] = useState("");

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

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)" }}>

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
          <span style={{
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
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`defense-nav-link${active ? " active" : ""}`}
              >
                <Icon />
                {label}
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
