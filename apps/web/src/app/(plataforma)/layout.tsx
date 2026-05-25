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
      if (!user && pathname !== "/login") {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });
  }, [pathname, router]);

  if (!ready) return null;

  return <>{children}</>;
}
