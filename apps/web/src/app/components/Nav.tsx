"use client";

import { useState, useEffect } from "react";
import { ETZLogoMark } from "./ETZLogo";

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navConfig = {
  defense: {
    label: "ETZ Defense",
    href: "/defense",
    back: false,
    links: ["Produto", "Segurança", "Acesso"],
    cta: "Falar com Especialista",
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
        backgroundColor: "var(--paper)",
        borderBottom: "1px solid var(--rule)",
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
          height: 60,
          gap: 24,
        }}
      >
        {/* Logo / back link */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {config.back && (
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--muted)",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                transition: "color var(--transition), background var(--transition)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.color = "var(--ink)";
                el.style.background = "var(--rule-soft)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.color = "var(--muted)";
                el.style.background = "transparent";
              }}
            >
              <ArrowLeft />
              ETZ Intelligence
            </a>
          )}
          <a
            href={config.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ETZLogoMark size={28} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>
                ETZ
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "var(--muted)", textTransform: "uppercase" }}>
                Defense
              </span>
            </span>
          </a>
        </div>

        {/* Nav links */}
        {config.links.length > 0 && (
          <nav
            className="hidden md:flex"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {config.links.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  padding: "8px 14px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--muted)",
                  borderRadius: "var(--radius-md)",
                  transition: "color var(--transition), background var(--transition)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "var(--ink)";
                  el.style.background = "var(--rule-soft)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "var(--muted)";
                  el.style.background = "transparent";
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        )}

        {/* CTA */}
        {config.cta && (
          <button className="btn-primary btn-primary-sm">{config.cta}</button>
        )}

        {/* Hub: spacer so logo stays left */}
        {!config.cta && <div />}
      </div>
    </header>
  );
}
