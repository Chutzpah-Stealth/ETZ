import { Shield, Search, Landmark, Radar, Flag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const orgs: { icon: LucideIcon; label: string }[] = [
  { icon: Shield,   label: "Polícias Militares" },
  { icon: Search,   label: "Polícia Civil" },
  { icon: Landmark, label: "Polícia Federal" },
  { icon: Radar,    label: "Inteligência" },
  { icon: Flag,     label: "Defesa Nacional" },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="wrap">
        <div className="trust-strip-lbl">Concebido para a operação de</div>
        <div className="trust-strip-logos">
          {orgs.map(({ icon: Icon, label }) => (
            <div key={label} className="trust-strip-org">
              <span className="trust-strip-glyph">
                <Icon size={16} color="var(--ink-400)" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
