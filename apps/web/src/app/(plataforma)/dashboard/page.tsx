"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ETZLogoMark } from "../../components/ETZLogo";
import { signOut } from "../../../lib/auth";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data()?.role === "superadmin") {
        router.replace("/admin");
      }
    });
    return unsubscribe;
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper-2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--rule)",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ETZLogoMark size={24} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            ETZ
          </span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Sair
        </button>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Plataforma
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            Em construção.
          </p>
        </div>
      </div>
    </main>
  );
}
