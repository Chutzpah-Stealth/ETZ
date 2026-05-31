import {
  LayoutDashboard,
  Target,
  FolderSearch,
  Radio,
  Share2,
  FileText,
  User,
  Unlock,
} from "lucide-react";

export default function ProductMock() {
  return (
    <div className="mock">
      {/* barra superior */}
      <div className="mock-bar">
        <div className="mock-bar-dots">
          <span />
          <span />
          <span />
        </div>
        <span style={{ marginLeft: "auto" }}>
          <span
            className="cls"
            data-c="secret"
            style={{ fontSize: 10, padding: "2px 7px 2px 9px" }}
          >
            Secreto
          </span>
        </span>
      </div>

      {/* corpo: rail + canvas */}
      <div className="mock-body">
        {/* rail de ícones */}
        <div className="mock-rail">
          <LayoutDashboard size={18} color="var(--ink-400)" />
          <Target size={18} color="var(--accent)" />
          <FolderSearch size={18} color="var(--ink-400)" />
          <Radio size={18} color="var(--ink-400)" />
          <Share2 size={18} color="var(--ink-400)" />
          <FileText size={18} color="var(--ink-400)" />
        </div>

        {/* canvas principal */}
        <div className="mock-canvas">
          {/* mini métricas */}
          <div className="mock-metrics">
            <div className="mock-mini-metric">
              <div className="l">Alvos ativos</div>
              <div className="v">248</div>
            </div>
            <div className="mock-mini-metric">
              <div className="l">Operações</div>
              <div className="v">37</div>
            </div>
            <div className="mock-mini-metric">
              <div className="l">QTCs</div>
              <div className="v">1.204</div>
            </div>
          </div>

          {/* alvo 1 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "12px 14px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              className="target-card-photo"
              style={{
                width: 40, height: 40, borderRadius: "var(--r-md)",
                background: "var(--surface-3)", border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--ink-300)",
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                Marcos A. Ferreira
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span className="status" data-s="foragido" style={{ padding: "2px 7px", fontSize: 11 }}>
                  <span className="dot" />
                  Foragido
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-400)" }}>
                  042.•••.•••-11
                </span>
              </div>
            </div>
            <div>
              <span className="badge badge--high" style={{ padding: "3px 7px", fontSize: 10, borderRadius: "var(--r-xs)", border: "1px solid rgba(196,57,47,.18)" }}>
                <span className="dot" />
                Alto
              </span>
            </div>
          </div>

          {/* alvo 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "12px 14px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: "var(--r-md)",
                background: "var(--accent-tint)", border: "1px solid var(--accent-line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                color: "var(--accent)",
              }}
            >
              DR
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                Daniela Rocha
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span className="status" data-s="investigado" style={{ padding: "2px 7px", fontSize: 11 }}>
                  <span className="dot" />
                  Investigado
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-400)" }}>
                  307.•••.•••-88
                </span>
              </div>
            </div>
            <div>
              <span className="badge badge--low" style={{ padding: "3px 7px", fontSize: 10, borderRadius: "var(--r-xs)", border: "1px solid rgba(31,138,82,.18)" }}>
                <span className="dot" />
                Baixo
              </span>
            </div>
          </div>

          {/* alerta */}
          <div
            className="alert alert--danger"
            style={{ padding: "10px 12px" }}
          >
            <Unlock size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="ttl" style={{ fontSize: 12.5 }}>Alerta de soltura</div>
              <div className="time">há 12 min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
