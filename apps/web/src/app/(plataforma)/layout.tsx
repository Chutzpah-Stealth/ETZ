"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "../../lib/auth";

export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthChange((user) => {
      // usuário autenticado na tela de login → redireciona para dashboard
      if (user && pathname === "/login") {
        router.replace("/dashboard");
        return;
      }
      // usuário não autenticado fora do login → redireciona para login
      if (!user && pathname !== "/login") {
        router.replace("/login");
        return;
      }
      setReady(true);
    });
  }, [pathname, router]);

  // /login não precisa aguardar auth — renderiza imediatamente
  if (!ready && pathname !== "/login") return null;

  return <>{children}</>;
}
