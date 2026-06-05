"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "../../../../../lib/auth";
import { ImageUploader } from "../../_components/ImageUploader";
import type {
  TargetStatus, RiskLevel, ClassificationLevel,
  TargetAddress, TargetTattoo, TargetAssociate, TargetCriminalRecord, TargetWarrant,
  Case, CaseTargetRole,
} from "@etz/shared-types";
import {
  TARGET_STATUS_LABEL, RISK_LEVEL_LABEL, CLASSIFICATION_LABEL, LINK_TYPE_LABEL,
  CASE_STATUS_LABEL, CASE_TARGET_ROLE_LABEL,
} from "@etz/shared-types";

type FormState = {
  fullName: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  gender: "" | "masculino" | "feminino" | "outro";
  maritalStatus: string;
  spouse: string;
  children: string;
  nationality: string;
  operationAreas: string;
  aliases: string;
  description: string;
  vehicles: string;
  cpf: string;
  rg: string;
  passport: string;
  phones: string;
  emails: string;
  tattoos: TargetTattoo[];
  addresses: TargetAddress[];
  criminalHistory: TargetCriminalRecord[];
  organizations: string;
  associates: TargetAssociate[];
  warrants: TargetWarrant[];
  prisonStatus: string;
  prisonPavilion: string;
  prisonWing: string;
  prisonCell: string;
  status: TargetStatus | "";
  riskLevel: RiskLevel | "";
  classification: ClassificationLevel | "";
  analystNotes: string;
};

const INITIAL: FormState = {
  fullName: "", birthDate: "", fatherName: "", motherName: "",
  gender: "", maritalStatus: "", spouse: "", children: "",
  nationality: "", operationAreas: "", aliases: "", description: "", vehicles: "",
  cpf: "", rg: "", passport: "",
  phones: "", emails: "",
  tattoos: [], addresses: [],
  criminalHistory: [], organizations: "",
  associates: [], warrants: [],
  prisonStatus: "", prisonPavilion: "", prisonWing: "", prisonCell: "",
  status: "", riskLevel: "", classification: "",
  analystNotes: "",
};

function splitLines(s: string): string[] {
  return s.split("\n").map(l => l.trim()).filter(Boolean);
}

export default function NovoAlvoPage() {
  const router = useRouter();
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [photos, setPhotos]               = useState<string[]>([]);
  const [tattooImages, setTattooImages]   = useState<string[]>([]);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [addressImages, setAddressImages] = useState<string[]>([]);
  const [attachments, setAttachments]     = useState<string[]>([]);

  // Casos a vincular após criar o alvo (N→N)
  const [caseLinks, setCaseLinks]   = useState<{ caseId: string; name: string; role: CaseTargetRole }[]>([]);
  const [caseSearch, setCaseSearch] = useState("");
  const [caseResults, setCaseResults] = useState<Case[]>([]);
  const [searchingCase, setSearchingCase] = useState(false);

  async function searchCases(q: string) {
    setCaseSearch(q);
    if (!q.trim()) { setCaseResults([]); return; }
    setSearchingCase(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/defense/cases?search=${encodeURIComponent(q.trim())}`, { headers: { Authorization: `Bearer ${token}` } });
      setCaseResults(res.ok ? await res.json() : []);
    } catch { setCaseResults([]); }
    finally { setSearchingCase(false); }
  }

  function set(key: keyof FormState, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  // Tattoo helpers
  function addTattoo() {
    setForm(f => ({ ...f, tattoos: [...f.tattoos, { description: "", location: "" }] }));
  }
  function updateTattoo(i: number, field: keyof TargetTattoo, v: string) {
    setForm(f => {
      const t = [...f.tattoos];
      t[i] = { ...t[i], [field]: v };
      return { ...f, tattoos: t };
    });
  }
  function removeTattoo(i: number) {
    setForm(f => ({ ...f, tattoos: f.tattoos.filter((_, idx) => idx !== i) }));
  }

  // Address helpers
  function addAddress() {
    setForm(f => ({ ...f, addresses: [...f.addresses, { street: "", city: "", state: "", zip: "" }] }));
  }
  function updateAddress(i: number, field: keyof TargetAddress, v: string) {
    setForm(f => {
      const a = [...f.addresses];
      a[i] = { ...a[i], [field]: v };
      return { ...f, addresses: a };
    });
  }
  function removeAddress(i: number) {
    setForm(f => ({ ...f, addresses: f.addresses.filter((_, idx) => idx !== i) }));
  }

  // Crime helpers
  function addCrime() {
    setForm(f => ({ ...f, criminalHistory: [...f.criminalHistory, { crime: "", date: "", notes: "" }] }));
  }
  function updateCrime(i: number, field: keyof TargetCriminalRecord, v: string) {
    setForm(f => {
      const c = [...f.criminalHistory];
      c[i] = { ...c[i], [field]: v };
      return { ...f, criminalHistory: c };
    });
  }
  function removeCrime(i: number) {
    setForm(f => ({ ...f, criminalHistory: f.criminalHistory.filter((_, idx) => idx !== i) }));
  }

  // Associate helpers
  function addAssociate() {
    setForm(f => ({ ...f, associates: [...f.associates, { name: "", targetId: "", linkType: "outro" }] }));
  }
  function updateAssociate(i: number, field: keyof TargetAssociate, v: string) {
    setForm(f => {
      const a = [...f.associates];
      a[i] = { ...a[i], [field]: v };
      return { ...f, associates: a };
    });
  }
  function removeAssociate(i: number) {
    setForm(f => ({ ...f, associates: f.associates.filter((_, idx) => idx !== i) }));
  }

  // Warrant helpers
  function addWarrant() {
    setForm(f => ({ ...f, warrants: [...f.warrants, { number: "", details: "" }] }));
  }
  function updateWarrant(i: number, field: keyof TargetWarrant, v: string) {
    setForm(f => {
      const w = [...f.warrants];
      w[i] = { ...w[i], [field]: v };
      return { ...f, warrants: w };
    });
  }
  function removeWarrant(i: number) {
    setForm(f => ({ ...f, warrants: f.warrants.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { setError("Nome completo é obrigatório."); return; }
    setError(""); setLoading(true);

    try {
      const token = await getToken();
      const body = {
        fullName:        form.fullName.trim(),
        birthDate:       form.birthDate   || null,
        fatherName:      form.fatherName  || null,
        motherName:      form.motherName  || null,
        gender:          form.gender      || null,
        maritalStatus:   form.maritalStatus || null,
        spouse:          form.spouse      || null,
        children:        form.children !== "" ? Number(form.children) : null,
        nationality:     form.nationality || null,
        operationAreas:  splitLines(form.operationAreas),
        aliases:         splitLines(form.aliases),
        description:     form.description || null,
        vehicles:        splitLines(form.vehicles),
        cpf:             form.cpf         || null,
        rg:              form.rg          || null,
        passport:        form.passport    || null,
        phones:          splitLines(form.phones),
        emails:          splitLines(form.emails),
        tattoos:         form.tattoos.filter(t => t.description || t.location),
        addresses:       form.addresses.filter(a => a.street),
        criminalHistory: form.criminalHistory.filter(c => c.crime),
        organizations:   splitLines(form.organizations),
        associates:      form.associates.filter(a => a.name),
        warrants:        form.warrants.filter(w => w.number),
        prisonStatus:    form.prisonStatus    || null,
        prisonPavilion:  form.prisonPavilion  || null,
        prisonWing:      form.prisonWing      || null,
        prisonCell:      form.prisonCell      || null,
        status:          form.status          || null,
        riskLevel:       form.riskLevel       || null,
        classification:  form.classification  || null,
        analystNotes:    form.analystNotes    || null,

        photos,
        tattooImages,
        vehicleImages,
        addressImages,
        attachments,
      };

      const res = await fetch("/api/defense/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erro ao criar alvo");
      }

      const created = await res.json();

      // vincula o alvo recém-criado aos casos selecionados (N→N)
      if (caseLinks.length > 0) {
        await Promise.all(caseLinks.map(link =>
          fetch(`/api/defense/cases/${link.caseId}/targets`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ targetId: created.id, role: link.role }),
          })
        ));
      }

      router.push(`/alvos/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar alvo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 860, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--accent)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>
            ETZ Defense · Alvos
          </p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 29px)" }}>Novo Alvo</h1>
        </div>
        <Link href="/alvos" className="btn-secondary btn-primary--sm">← Voltar</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Informações Básicas */}
        <section className="form-section">
          <p className="form-section-title">Informações Básicas</p>
          <div className="form-row form-row-2">
            <FormField label="Nome Completo *">
              <input className="form-input" required placeholder="Nome completo" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            </FormField>
            <FormField label="Data de Nascimento">
              <input className="form-input" type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)} />
            </FormField>
          </div>
          <div className="form-row form-row-2">
            <FormField label="Nome do Pai">
              <input className="form-input" placeholder="Nome do pai" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
            </FormField>
            <FormField label="Nome da Mãe">
              <input className="form-input" placeholder="Nome da mãe" value={form.motherName} onChange={e => set("motherName", e.target.value)} />
            </FormField>
          </div>
          <div className="form-row form-row-3">
            <FormField label="Gênero">
              <select className="form-input form-select" value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">—</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </FormField>
            <FormField label="Estado Civil">
              <input className="form-input" placeholder="Ex: Casado" value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)} />
            </FormField>
            <FormField label="Nacionalidade">
              <input className="form-input" placeholder="Ex: Brasileiro" value={form.nationality} onChange={e => set("nationality", e.target.value)} />
            </FormField>
          </div>
          <div className="form-row form-row-2">
            <FormField label="Cônjuge">
              <input className="form-input" placeholder="Nome do cônjuge" value={form.spouse} onChange={e => set("spouse", e.target.value)} />
            </FormField>
            <FormField label="Filhos (quantidade)">
              <input className="form-input" type="number" min="0" placeholder="0" value={form.children} onChange={e => set("children", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Apelidos / Alcunhas (um por linha)">
            <textarea className="form-input form-textarea" placeholder={"Zé das Grades\nBruno do Morro"} value={form.aliases} onChange={e => set("aliases", e.target.value)} />
          </FormField>
          <FormField label="Áreas de Atuação (uma por linha)">
            <textarea className="form-input form-textarea" placeholder={"Zona Norte — SP\nCentro — RJ"} value={form.operationAreas} onChange={e => set("operationAreas", e.target.value)} />
          </FormField>
          <FormField label="Veículos (um por linha)">
            <textarea className="form-input form-textarea" style={{ minHeight: 60 }} placeholder={"Honda Civic prata — ABC-1234\nMoto CB 600 preta"} value={form.vehicles} onChange={e => set("vehicles", e.target.value)} />
          </FormField>
          <FormField label="Descrição Geral">
            <textarea className="form-input form-textarea" placeholder="Características físicas, comportamento, etc." value={form.description} onChange={e => set("description", e.target.value)} />
          </FormField>
        </section>

        {/* Tatuagens */}
        <section className="form-section">
          <p className="form-section-title">Tatuagens / Marcas</p>
          {form.tattoos.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-row form-row-2" style={{ flex: 1 }}>
                <FormField label="Descrição">
                  <input className="form-input" placeholder="Ex: Dragão" value={t.description} onChange={e => updateTattoo(i, "description", e.target.value)} />
                </FormField>
                <FormField label="Localização">
                  <input className="form-input" placeholder="Ex: Braço esquerdo" value={t.location} onChange={e => updateTattoo(i, "location", e.target.value)} />
                </FormField>
              </div>
              <button type="button" onClick={() => removeTattoo(i)} style={removeStyle}>×</button>
            </div>
          ))}
          <button type="button" onClick={addTattoo} style={addBtnStyle}>+ Adicionar tatuagem</button>
        </section>

        {/* Documentos */}
        <section className="form-section">
          <p className="form-section-title">Documentos</p>
          <div className="form-row form-row-3">
            <FormField label="CPF">
              <input className="form-input" placeholder="000.000.000-00" value={form.cpf} onChange={e => set("cpf", e.target.value)} />
            </FormField>
            <FormField label="RG">
              <input className="form-input" placeholder="00.000.000-0" value={form.rg} onChange={e => set("rg", e.target.value)} />
            </FormField>
            <FormField label="Passaporte">
              <input className="form-input" placeholder="AA000000" value={form.passport} onChange={e => set("passport", e.target.value)} />
            </FormField>
          </div>
        </section>

        {/* Contatos */}
        <section className="form-section">
          <p className="form-section-title">Contatos</p>
          <FormField label="Telefones (um por linha)">
            <textarea className="form-input form-textarea" style={{ minHeight: 60 }} placeholder={"(11) 99999-9999\n(21) 98888-8888"} value={form.phones} onChange={e => set("phones", e.target.value)} />
          </FormField>
          <FormField label="E-mails (um por linha)">
            <textarea className="form-input form-textarea" style={{ minHeight: 60 }} placeholder={"email@exemplo.com"} value={form.emails} onChange={e => set("emails", e.target.value)} />
          </FormField>
        </section>

        {/* Endereços */}
        <section className="form-section">
          <p className="form-section-title">Endereços</p>
          {form.addresses.map((a, i) => (
            <div key={i} style={{ background: "var(--paper-2)", borderRadius: "var(--radius-lg)", padding: "14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <FormField label="Logradouro">
                  <input className="form-input" placeholder="Rua, número, complemento" value={a.street} onChange={e => updateAddress(i, "street", e.target.value)} />
                </FormField>
                <div className="form-row form-row-3">
                  <FormField label="Cidade">
                    <input className="form-input" placeholder="São Paulo" value={a.city ?? ""} onChange={e => updateAddress(i, "city", e.target.value)} />
                  </FormField>
                  <FormField label="Estado">
                    <input className="form-input" placeholder="SP" maxLength={2} value={a.state ?? ""} onChange={e => updateAddress(i, "state", e.target.value)} />
                  </FormField>
                  <FormField label="CEP">
                    <input className="form-input" placeholder="00000-000" value={a.zip ?? ""} onChange={e => updateAddress(i, "zip", e.target.value)} />
                  </FormField>
                </div>
              </div>
              <button type="button" onClick={() => removeAddress(i)} style={removeStyle}>×</button>
            </div>
          ))}
          <button type="button" onClick={addAddress} style={addBtnStyle}>+ Adicionar endereço</button>
        </section>

        {/* Informações Criminais */}
        <section className="form-section">
          <p className="form-section-title">Histórico Criminal</p>
          {form.criminalHistory.map((c, i) => (
            <div key={i} style={{ background: "var(--paper-2)", borderRadius: "var(--radius-lg)", padding: "14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <FormField label="Crime">
                  <input className="form-input" placeholder="Tráfico de entorpecentes" value={c.crime} onChange={e => updateCrime(i, "crime", e.target.value)} />
                </FormField>
                <div className="form-row form-row-2">
                  <FormField label="Data">
                    <input className="form-input" type="date" value={c.date ?? ""} onChange={e => updateCrime(i, "date", e.target.value)} />
                  </FormField>
                  <FormField label="Observações">
                    <input className="form-input" placeholder="Detalhes adicionais" value={c.notes ?? ""} onChange={e => updateCrime(i, "notes", e.target.value)} />
                  </FormField>
                </div>
              </div>
              <button type="button" onClick={() => removeCrime(i)} style={removeStyle}>×</button>
            </div>
          ))}
          <button type="button" onClick={addCrime} style={addBtnStyle}>+ Adicionar crime</button>
        </section>

        {/* Vínculos */}
        <section className="form-section">
          <p className="form-section-title">Pessoas Vinculadas</p>
          {form.associates.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-row form-row-3" style={{ flex: 1 }}>
                <FormField label="Nome">
                  <input className="form-input" placeholder="Nome da pessoa" value={a.name} onChange={e => updateAssociate(i, "name", e.target.value)} />
                </FormField>
                <FormField label="Tipo de Vínculo">
                  <select className="form-input form-select" value={a.linkType} onChange={e => updateAssociate(i, "linkType", e.target.value)}>
                    {Object.entries(LINK_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </FormField>
                <FormField label="ID do Alvo (opcional)">
                  <input className="form-input" placeholder="ID se já cadastrado" value={a.targetId ?? ""} onChange={e => updateAssociate(i, "targetId", e.target.value)} />
                </FormField>
              </div>
              <button type="button" onClick={() => removeAssociate(i)} style={removeStyle}>×</button>
            </div>
          ))}
          <button type="button" onClick={addAssociate} style={addBtnStyle}>+ Adicionar vínculo</button>
          <FormField label="Organizações Criminosas (uma por linha)">
            <textarea className="form-input form-textarea" style={{ minHeight: 60 }} placeholder={"Primeiro Comando da Capital\nFamília do Norte"} value={form.organizations} onChange={e => set("organizations", e.target.value)} />
          </FormField>
        </section>

        {/* Mandados */}
        <section className="form-section">
          <p className="form-section-title">Mandados de Prisão</p>
          {form.warrants.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div className="form-row form-row-2" style={{ flex: 1 }}>
                <FormField label="Número do Mandado">
                  <input className="form-input" placeholder="0000000-00.0000.0.00.0000" value={w.number} onChange={e => updateWarrant(i, "number", e.target.value)} />
                </FormField>
                <FormField label="Detalhes">
                  <input className="form-input" placeholder="Vara, comarca, etc." value={w.details ?? ""} onChange={e => updateWarrant(i, "details", e.target.value)} />
                </FormField>
              </div>
              <button type="button" onClick={() => removeWarrant(i)} style={removeStyle}>×</button>
            </div>
          ))}
          <button type="button" onClick={addWarrant} style={addBtnStyle}>+ Adicionar mandado</button>
        </section>

        {/* Informações Penitenciárias */}
        <section className="form-section">
          <p className="form-section-title">Informações Penitenciárias</p>
          <div className="form-row form-row-2">
            <FormField label="Status Prisional">
              <input className="form-input" placeholder="Ex: Preso Provisório" value={form.prisonStatus} onChange={e => set("prisonStatus", e.target.value)} />
            </FormField>
            <FormField label="Pavilhão">
              <input className="form-input" placeholder="Ex: Pavilhão A" value={form.prisonPavilion} onChange={e => set("prisonPavilion", e.target.value)} />
            </FormField>
          </div>
          <div className="form-row form-row-2">
            <FormField label="Ala">
              <input className="form-input" placeholder="Ex: Ala 2" value={form.prisonWing} onChange={e => set("prisonWing", e.target.value)} />
            </FormField>
            <FormField label="Cela">
              <input className="form-input" placeholder="Ex: Cela 14" value={form.prisonCell} onChange={e => set("prisonCell", e.target.value)} />
            </FormField>
          </div>
        </section>

        {/* Análise de Risco */}
        <section className="form-section">
          <p className="form-section-title">Análise de Risco</p>
          <div className="form-row form-row-3">
            <FormField label="Status">
              <select className="form-input form-select" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="">— Indefinido —</option>
                {Object.entries(TARGET_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FormField>
            <FormField label="Nível de Risco">
              <select className="form-input form-select" value={form.riskLevel} onChange={e => set("riskLevel", e.target.value)}>
                <option value="">— Indefinido —</option>
                {Object.entries(RISK_LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FormField>
            <FormField label="Classificação">
              <select className="form-input form-select" value={form.classification} onChange={e => set("classification", e.target.value)}>
                <option value="">— Indefinida —</option>
                {Object.entries(CLASSIFICATION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FormField>
          </div>
        </section>

        {/* Fotos e Mídia */}
        <section className="form-section">
          <p className="form-section-title">Fotos e Mídia</p>

          <FormField label="Fotos do Alvo">
            <ImageUploader
              images={photos}
              category="photos"
              onAdd={(url: string) => setPhotos(p => [...p, url])}
              onRemove={(i: number) => setPhotos(p => p.filter((_, idx) => idx !== i))}
            />
          </FormField>

          <FormField label="Imagens de Tatuagens">
            <ImageUploader
              images={tattooImages}
              category="tattoos"
              onAdd={(url: string) => setTattooImages(p => [...p, url])}
              onRemove={(i: number) => setTattooImages(p => p.filter((_, idx) => idx !== i))}
            />
          </FormField>

          <FormField label="Imagens de Veículos">
            <ImageUploader
              images={vehicleImages}
              category="vehicles"
              onAdd={(url: string) => setVehicleImages(p => [...p, url])}
              onRemove={(i: number) => setVehicleImages(p => p.filter((_, idx) => idx !== i))}
            />
          </FormField>

          <FormField label="Imagens de Endereços">
            <ImageUploader
              images={addressImages}
              category="addresses"
              onAdd={(url: string) => setAddressImages(p => [...p, url])}
              onRemove={(i: number) => setAddressImages(p => p.filter((_, idx) => idx !== i))}
            />
          </FormField>

          <FormField label="Outros Anexos">
            <ImageUploader
              images={attachments}
              category="attachments"
              onAdd={(url: string) => setAttachments(p => [...p, url])}
              onRemove={(i: number) => setAttachments(p => p.filter((_, idx) => idx !== i))}
            />
          </FormField>
        </section>

        {/* Casos Vinculados */}
        <section className="form-section">
          <p className="form-section-title">Casos Vinculados</p>
          <div className="form-field" style={{ position: "relative" }}>
            <label className="form-label">Vincular a casos existentes (busque pelo nome)</label>
            <input
              type="text"
              value={caseSearch}
              onChange={e => searchCases(e.target.value)}
              placeholder="Digite para buscar casos da unidade…"
              className="form-input"
              autoComplete="off"
            />
            {caseSearch.trim() && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4,
                background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-md)", maxHeight: 280, overflowY: "auto",
              }}>
                {searchingCase ? (
                  <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Buscando…</p>
                ) : caseResults.length === 0 ? (
                  <p style={{ padding: "12px 14px", fontSize: 13, color: "var(--ink-400)", fontFamily: "var(--font-ui)" }}>Nenhum caso encontrado.</p>
                ) : (
                  caseResults.map(c => {
                    const already = caseLinks.some(l => l.caseId === c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={already}
                        onClick={() => {
                          if (already) return;
                          setCaseLinks(prev => [...prev, { caseId: c.id, name: c.name, role: "outro" }]);
                          setCaseSearch(""); setCaseResults([]);
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                          padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)",
                          background: "none", cursor: already ? "default" : "pointer", opacity: already ? 0.5 : 1,
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", display: "block" }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: "var(--ink-500)", fontFamily: "var(--font-mono)" }}>
                            {c.caseNumber ?? "sem número"} · {CASE_STATUS_LABEL[c.status]}
                          </span>
                        </span>
                        {already
                          ? <span style={{ fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>selecionado</span>
                          : <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>+ vincular</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {caseLinks.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 4 }}>
              <table className="data" style={{ width: "100%" }}>
                <thead>
                  <tr><th>Caso</th><th>Função no caso</th><th style={{ width: 1 }}></th></tr>
                </thead>
                <tbody>
                  {caseLinks.map((l, i) => (
                    <tr key={l.caseId}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</td>
                      <td>
                        <select
                          value={l.role}
                          onChange={e => setCaseLinks(prev => prev.map((x, j) => j === i ? { ...x, role: e.target.value as CaseTargetRole } : x))}
                          className="form-input form-select"
                          style={{ height: 32, fontSize: 12, minWidth: 130 }}
                        >
                          {Object.entries(CASE_TARGET_ROLE_LABEL).map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
                        </select>
                      </td>
                      <td>
                        <button type="button" onClick={() => setCaseLinks(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "4px 9px", cursor: "pointer" }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Notas do Analista */}
        <section className="form-section">
          <p className="form-section-title">Notas do Analista</p>
          <FormField label="Notas gerais">
            <textarea
              className="form-input form-textarea"
              style={{ minHeight: 100 }}
              placeholder="O que se sabe sobre o alvo, contexto operacional, informações relevantes…"
              value={form.analystNotes}
              onChange={e => set("analystNotes", e.target.value)}
            />
          </FormField>
        </section>

        {error && (
          <p style={{ fontSize: 13, color: "var(--danger)", background: "var(--danger-tint)", border: "1px solid #f5c6c2", borderRadius: "var(--r-sm)", padding: "10px 14px", fontFamily: "var(--font-ui)" }}>
            {error}
          </p>
        )}

        <div className="form-submit-row" style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
          <Link href="/alvos" className="btn-secondary" style={{ flex: 1, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, minHeight: 44, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Salvando…" : "Criar Alvo"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

const removeStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 36, height: 36,
  background: "none",
  border: "1px solid var(--line-strong)",
  borderRadius: "var(--r-sm)",
  cursor: "pointer",
  fontSize: 16,
  color: "var(--ink-500)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const addBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px dashed var(--line-strong)",
  borderRadius: "var(--r-sm)",
  color: "var(--accent)",
  fontSize: 13,
  fontWeight: 500,
  padding: "10px 14px",
  minHeight: 44,
  cursor: "pointer",
  fontFamily: "var(--font-ui)",
  alignSelf: "flex-start",
};
