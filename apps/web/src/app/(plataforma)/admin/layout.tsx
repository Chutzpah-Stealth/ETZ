"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../lib/firebase";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signOut } from "../../../lib/auth";

function IconLayoutDashboard() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="9" width="18" height="14" rx="1"/>
      <path d="M8 9V5a2 2 0 0 1 4 0"/>
      <path d="M8 9h8"/>
      <line x1="9" y1="13" x2="9" y2="13.01"/>
      <line x1="15" y1="13" x2="15" y2="13.01"/>
      <line x1="9" y1="17" x2="9" y2="17.01"/>
      <line x1="15" y1="17" x2="15" y2="17.01"/>
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

const NAV = [
  { href: "/admin",              label: "Visão Geral",  icon: IconLayoutDashboard },
  { href: "/admin/usuarios",     label: "Usuários",     icon: IconUsers           },
  { href: "/admin/instituicoes", label: "Instituições", icon: IconBuilding        },
  { href: "/admin/auditoria",    label: "Auditoria",    icon: IconFileText        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady]             = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.role !== "superadmin") {
        router.replace("/dashboard");
        return;
      }
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
    <div style={{ minHeight: "100dvh", background: "var(--canvas)" }}>

      {/* Topbar */}
      <header className="admin-topbar">
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
          }}>Admin</span>
        </div>

        {/* Super Admin badge */}
        <span className="defense-role-pill" style={{
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          color: "var(--accent)",
          background: "var(--accent-tint)",
          border: "1px solid var(--accent-line)",
          borderRadius: "var(--r-full)",
          padding: "3px 10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          Super Admin
        </span>
      </header>

      {/* Overlay */}
      <div
        className={`admin-drawer-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <nav style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-link${active ? " active" : ""}`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
          <button
            onClick={handleSignOut}
            className="admin-nav-link"
            style={{ width: "100%" }}
          >
            <IconLogOut />
            Sair
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className={`admin-main${sidebarOpen ? " open" : ""}`}>
        {children}
      </main>
    </div>
  );
}
