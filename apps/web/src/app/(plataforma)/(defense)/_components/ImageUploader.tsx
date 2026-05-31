"use client";

import { useRef, useState, useEffect } from "react";
import { getToken } from "../../../../lib/auth";

interface Props {
  images: string[];
  category: string;
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
  large?: boolean;
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(10,12,18,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 20, right: 24,
          width: 40, height: 40,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          color: "#fff",
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1001,
        }}
        aria-label="Fechar"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: 6,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}

export function ImageUploader({ images, category, onAdd, onRemove, readOnly, large }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [lightbox, setLightbox]   = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      const res = await fetch("/api/defense/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar imagem");
      onAdd(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (readOnly && images.length === 0) return null;

  if (large) {
    return (
      <>
        {lightbox && <Lightbox url={lightbox} onClose={() => setLightbox(null)} />}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
        }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                onClick={() => setLightbox(url)}
                style={{
                  width: 200,
                  height: 260,
                  objectFit: "cover",
                  objectPosition: "top center",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--line)",
                  cursor: "zoom-in",
                  display: "block",
                  transition: "transform 140ms ease, box-shadow 140ms ease",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                }}
              />
              {i === 0 && (
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500,
                  color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "var(--accent-tint)",
                  borderRadius: "var(--r-full)",
                  padding: "2px 8px",
                  pointerEvents: "none",
                }}>
                  Foto de capa
                </span>
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label="Remover imagem"
                  style={{
                    position: "absolute", top: 6, right: 6,
                    width: 24, height: 24,
                    background: "rgba(10,12,18,0.65)",
                    border: "none", borderRadius: "50%",
                    color: "#fff", fontSize: 14, lineHeight: 1,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >×</button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{
                width: 200, height: 260,
                border: "2px dashed var(--line-strong)",
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
                color: "var(--ink-400)",
                fontSize: 28,
                cursor: uploading ? "default" : "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 8,
                opacity: uploading ? 0.6 : 1,
                transition: "border-color var(--transition), background var(--transition)",
              }}
              onMouseEnter={e => {
                if (!uploading) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.background = "var(--accent-tint)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
              }}
            >
              {uploading ? (
                <span style={{ fontSize: 13, fontFamily: "var(--font-ui)", color: "var(--ink-400)" }}>Enviando…</span>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-ui)" }}>Adicionar foto</span>
                </>
              )}
            </button>
          )}
        </div>
        {error && (
          <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8, textAlign: "center" }}>{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </>
    );
  }

  return (
    <div>
      <div className="img-gallery">
        {images.map((url, i) => (
          <div key={i} className="img-thumb">
            <span style={{ cursor: "zoom-in" }} onClick={() => setLightbox(url)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </span>
            {!readOnly && (
              <button
                type="button"
                className="img-thumb-remove"
                onClick={() => onRemove(i)}
                aria-label="Remover imagem"
              >×</button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="img-add-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Adicionar imagem"
          >
            {uploading ? "…" : "+"}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: "#c0392b", marginTop: 6 }}>{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {lightbox && <Lightbox url={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
