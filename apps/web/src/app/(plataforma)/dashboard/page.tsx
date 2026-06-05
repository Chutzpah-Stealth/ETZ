"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }

      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? snap.data()?.role : null;

      if (role === "superadmin") {
        router.replace("/admin");
      } else {
        router.replace("/alvos");
      }
    });
    return unsubscribe;
  }, [router]);

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--canvas)",
    }}>
      <p style={{
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: "var(--ink-400)",
      }}>
        Carregando…
      </p>
    </div>
  );
}
