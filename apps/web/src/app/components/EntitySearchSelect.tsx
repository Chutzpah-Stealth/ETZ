"use client";

import { useState } from "react";
import { getToken } from "../../lib/auth";

interface EntitySearchSelectProps<T> {
  /** label mono acima do input */
  label: string;
  placeholder: string;
  /** constrói a URL de busca a partir do termo já trimado */
  searchUrl: (query: string) => string;
  /** chave React de cada resultado */
  getKey: (item: T) => string;
  /** linha principal (nome) */
  getPrimary: (item: T) => string;
  /** linha secundária mono (CPF, nº do caso, status…) */
  getSecondary: (item: T) => string;
  /** item já selecionado/vinculado? (desabilita) */
  isSelected: (item: T) => boolean;
  /** ação ao selecionar um resultado */
  onSelect: (item: T) => void;
  /** texto quando já selecionado (default "selecionado") */
  selectedLabel?: string;
  /** texto da ação de adicionar (default "+ vincular") */
  addLabel?: string;
}

/**
 * Busca-autocomplete genérico contra uma rota autenticada.
 * Substitui o bloco duplicado de input + dropdown usado em casos/[id], alvos/[id] e alvos/novo.
 */
export function EntitySearchSelect<T>({
  label, placeholder, searchUrl, getKey, getPrimary, getSecondary,
  isSelected, onSelect, selectedLabel = "selecionado", addLabel = "+ vincular",
}: EntitySearchSelectProps<T>) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<T[]>([]);
  const [searching, setSearching] = useState(false);

  async function run(value: string) {
    setQuery(value);
    if (!value.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const token = await getToken();
      const res = await fetch(searchUrl(value.trim()), { headers: { Authorization: `Bearer ${token}` } });
      setResults(res.ok ? await res.json() : []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }

  function handleSelect(item: T) {
    onSelect(item);
    setQuery(""); setResults([]);
  }

  return (
    <div className="form-field" style={{ position: "relative", marginBottom: 4 }}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        value={query}
        onChange={e => run(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        autoComplete="off"
      />
      {query.trim() && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4,
          background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-md)", maxHeight: 280, overflowY: "auto",
        }}>
          {searching ? (
            <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Buscando…</p>
          ) : results.length === 0 ? (
            <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhum resultado encontrado.</p>
          ) : (
            results.map(item => {
              const sel = isSelected(item);
              return (
                <button
                  key={getKey(item)}
                  type="button"
                  disabled={sel}
                  onClick={() => { if (!sel) handleSelect(item); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)",
                    background: "none", cursor: sel ? "default" : "pointer", opacity: sel ? 0.5 : 1,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", display: "block" }}>{getPrimary(item)}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>{getSecondary(item)}</span>
                  </span>
                  <span style={{ fontSize: 11, color: sel ? "var(--ink-400)" : "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {sel ? selectedLabel : addLabel}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
