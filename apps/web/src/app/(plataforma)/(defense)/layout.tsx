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
  gestor:       "Gestor",
  analista:     "Analista",
  agente_campo: "Agente de Campo",
};

const NAV = [
  { href: "/alvos", label: "Alvos", icon: TargetIcon },
];

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

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

      if (userRole === "superadmin") {
        router.replace("/admin");
        return;
      }

      if (!DEFENSE_ROLES.includes(userRole as DefenseRole)) {
        router.replace("/login");
        return;
      }

      if (data?.status === "revoked") {
        await signOut();
        router.replace("/login");
        return;
      }

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
    <div style={{ minHeight: "100vh", background: "var(--paper-2)" }}>

      {/* Topbar */}
      <header className="defense-topbar">
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink)", display: "flex", alignItems: "center",
            justifyContent: "center", padding: 6, borderRadius: "var(--radius-md)",
            flexShrink: 0,
          }}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <ETZLogoMark size={22} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>ETZ</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Defense</span>
        </div>
        {role && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: "var(--muted)",
            background: "var(--paper-2)", borderRadius: "var(--radius-pill)",
            padding: "3px 10px", whiteSpace: "nowrap",
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
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--rule-soft)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </p>
        </div>

        <nav style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: 2 }}>
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

        <div style={{ padding: "8px 0", borderTop: "1px solid var(--rule)" }}>
          <button onClick={handleSignOut} className="defense-nav-link">
            <SignOutIcon />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`defense-main${sidebarOpen ? " open" : ""}`}>
        {children}
      </main>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
