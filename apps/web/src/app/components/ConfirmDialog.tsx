"use client";

import { useCallback, useEffect, useState } from "react";

type ConfirmVariant = "danger" | "default";

export interface ConfirmOptions {
  title:         string;
  message:       string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:      ConfirmVariant;
}

function IconAlert({ variant }: { variant: ConfirmVariant }) {
  const color = variant === "danger" ? "var(--danger)" : "var(--accent)";
  const bg    = variant === "danger" ? "var(--danger-tint)" : "var(--accent-tint)";
  return (
    <div style={{
      width: 40, height: 40, flexShrink: 0,
      borderRadius: "var(--r-md)", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", color,
    }}>
      {variant === "danger" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
    </div>
  );
}

function ConfirmDialog({
  title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", variant = "default",
  onConfirm, onCancel,
}: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter")  onConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="confirm-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <IconAlert variant={variant} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: 17, fontFamily: "var(--font-display)", fontWeight: 600,
              letterSpacing: "-0.012em", color: "var(--ink-900)", marginBottom: 6,
              overflowWrap: "break-word",
            }}>
              {title}
            </h2>
            <p style={{
              fontSize: 14, fontFamily: "var(--font-ui)", color: "var(--ink-600)",
              lineHeight: 1.5, overflowWrap: "break-word",
            }}>
              {message}
            </p>
          </div>
        </div>

        <div className="confirm-actions">
          <button onClick={onCancel} className="btn-secondary" style={{ minHeight: 44 }}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={variant === "danger" ? "btn-danger" : "btn-primary"}
            style={{ minHeight: 44 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook que substitui window.confirm() por um diálogo do design system.
 * Uso:
 *   const { confirm, ConfirmUI } = useConfirm();
 *   if (!(await confirm({ title, message, variant: "danger" }))) return;
 *   ...
 *   return ( <> {ConfirmUI} ...resto da página... </> );
 */
export function useConfirm() {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>(resolve => setState({ opts, resolve }));
  }, []);

  const settle = useCallback((value: boolean) => {
    setState(prev => { prev?.resolve(value); return null; });
  }, []);

  const ConfirmUI = state ? (
    <ConfirmDialog
      {...state.opts}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, ConfirmUI };
}
