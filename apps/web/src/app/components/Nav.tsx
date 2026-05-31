"use client";

import { useState, useEffect } from "react";
import { ETZLogoMark } from "./ETZLogo";

const navConfig = {
  defense: {
    label: "ETZ Defense",
    href: "/defense",
    back: false,
    links: ["Produto", "Segurança", "Acesso"],
    cta: "Solicitar Acesso",
  },
};

type NavVariant = "defense";

export default function Nav({ variant = "defense" }: { variant?: NavVariant }) {
  const [scrolled, setScrolled] = useState(false);
  const config = navConfig[variant];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--line)",
        transition: "box-shadow var(--transition-slow)",
        boxShadow: scrolled ? "var(--shadow-md)" : "none",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          gap: 24,
        }}
      >
        <a
          href={config.href}
          style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
        >
          <ETZLogoMark size={26} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              color: "var(--accent)",
            }}>
              ETZ
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              color: "var(--ink-400)",
              textTransform: "uppercase",
            }}>
              Defense
            </span>
          </span>
        </a>

        {config.links.length > 0 && (
          <nav
            style={{ display: "flex", alignItems: "center", gap: 2 }}
            className="hidden md:flex"
          >
            {config.links.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  padding: "7px 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "var(--font-ui)",
                  color: "var(--ink-600)",
                  borderRadius: "var(--r-md)",
                  transition: "color var(--transition), background var(--transition)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--ink-900)";
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ink-600)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        )}

        {config.cta && (
          <button className="btn-primary btn-primary--sm" style={{ flexShrink: 0 }}>
            {config.cta}
          </button>
        )}

        {!config.cta && <div />}
      </div>
    </header>
  );
}
