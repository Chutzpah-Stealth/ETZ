"use client";

import { useState } from "react";
import { CalendarCheck, X, Menu } from "lucide-react";

const HexLogo = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 L28.12 9 L28.12 23 L16 30 L3.88 23 L3.88 9 Z" stroke="var(--accent)" strokeWidth="2" fill="var(--accent-tint)" />
    <path d="M16 8.5 L22.36 12.25 L22.36 19.75 L16 23.5 L9.64 19.75 L9.64 12.25 Z" stroke="var(--accent)" strokeWidth="1.25" fill="none" opacity="0.45" />
    <circle cx="16" cy="16" r="2.4" fill="var(--accent)" />
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="lp-nav">
        <div className="wrap lp-nav-row">
          <a href="/defense" className="lp-brand">
            <HexLogo />
            <div className="lp-brand-wd">
              <b>ETZ</b> <span className="df">DEFENSE</span>
            </div>
          </a>

          <nav className="lp-nav-links">
            <a href="#modulos">Módulos</a>
            <a href="#acessos">Níveis de acesso</a>
            <a href="#analise">Análise</a>
            <a href="#seguranca">Segurança</a>
          </nav>

          {/* Desktop actions */}
          <div className="lp-nav-actions">
            <a href="/login" className="btn btn--ghost btn--sm">
              Acessar plataforma
            </a>
            <a href="https://calendly.com/hanielrolemberg" target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm">
              <CalendarCheck size={14} />
              Solicitar demonstração
            </a>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="lp-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      {open && (
        <>
          <div className="lp-drawer-overlay" onClick={() => setOpen(false)} />
          <div className="lp-drawer">
            <div className="lp-drawer-header">
              <a href="/defense" className="lp-brand" onClick={() => setOpen(false)}>
                <HexLogo />
                <div className="lp-brand-wd">
                  <b>ETZ</b> <span className="df">DEFENSE</span>
                </div>
              </a>
              <button className="lp-drawer-close" onClick={() => setOpen(false)} aria-label="Fechar menu">
                <X size={18} />
              </button>
            </div>

            <nav className="lp-drawer-nav">
              <a href="#modulos"   onClick={() => setOpen(false)}>Módulos</a>
              <a href="#acessos"   onClick={() => setOpen(false)}>Níveis de acesso</a>
              <a href="#analise"   onClick={() => setOpen(false)}>Análise</a>
              <a href="#seguranca" onClick={() => setOpen(false)}>Segurança</a>
            </nav>

            <div className="lp-drawer-actions">
              <a href="/login" className="btn btn--secondary" onClick={() => setOpen(false)}>
                Acessar plataforma
              </a>
              <a href="https://calendly.com/hanielrolemberg" target="_blank" rel="noopener noreferrer" className="btn btn--primary" onClick={() => setOpen(false)}>
                <CalendarCheck size={15} />
                Solicitar demonstração
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
