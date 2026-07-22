import { useState, useEffect } from "react";
import { Send, TrendingUp, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/format";

export default function Sell() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", deal_type: "prodej", property_type: "byt",
    location: "", area: "", message: "", preferred_agent: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/agents").then((r) => setAgents(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    const agentName = form.preferred_agent
      ? (agents.find((a) => a.id === form.preferred_agent)?.name || "-")
      : "Nezáleží – přidělte makléře";
    const body = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: `Poptávka: ${DEAL_TYPES[form.deal_type]} nemovitosti`,
      message:
        `Typ obchodu: ${DEAL_TYPES[form.deal_type]}\n` +
        `Typ nemovitosti: ${PROPERTY_TYPES[form.property_type]}\n` +
        `Lokalita: ${form.location || "-"}\n` +
        `Plocha: ${form.area ? form.area + " m²" : "-"}\n` +
        `Preferovaný makléř: ${agentName}\n\n` +
        `Popis / poznámka:\n${form.message || "-"}`,
    };
    try {
      await api.post("/contact", body);
      toast.success("Děkujeme! Ozveme se vám co nejdříve s nezávaznou nabídkou.");
      setForm({ name: "", email: "", phone: "", deal_type: "prodej", property_type: "byt", location: "", area: "", message: "", preferred_agent: "" });
    } catch {
      toast.error("Odeslání se nezdařilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  const inp = "w-full border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:border-[#003DA5]";
  const lbl = "text-xs font-bold uppercase tracking-wider text-[#0A0A0A]";

  return (
    <div data-testid="sell-page">
      {/* Header band */}
      <section className="bg-[#003DA5] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff8a93]">Prodej a pronájem</span>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mt-3 max-w-2xl">
            Prodejte nebo pronajměte nemovitost s námi
          </h1>
          <p className="mt-5 text-lg text-blue-100 max-w-2xl">
            Vyplňte krátký formulář a my vám připravíme nezávazné tržní ocenění zdarma.
            O celý proces se postaráme za vás – rychle, bezpečně a s osobním přístupem.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-5" data-testid="sell-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>Jméno a příjmení *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="sell-name" className={`mt-1.5 ${inp}`} />
              </div>
              <div>
                <label className={lbl}>Telefon *</label>
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="sell-phone" className={`mt-1.5 ${inp}`} />
              </div>
            </div>
            <div>
              <label className={lbl}>E-mail *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="sell-email" className={`mt-1.5 ${inp}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>Mám zájem o</label>
                <select value={form.deal_type} onChange={(e) => setForm({ ...form, deal_type: e.target.value })} data-testid="sell-deal-type" className={`mt-1.5 ${inp}`}>
                  {Object.entries(DEAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Typ nemovitosti</label>
                <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} data-testid="sell-property-type" className={`mt-1.5 ${inp}`}>
                  {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>Lokalita</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="např. Tachov" data-testid="sell-location" className={`mt-1.5 ${inp}`} />
              </div>
              <div>
                <label className={lbl}>Plocha (m²)</label>
                <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} data-testid="sell-area" className={`mt-1.5 ${inp}`} />
              </div>
            </div>
            <div>
              <label className={lbl}>Preferovaný makléř</label>
              <select value={form.preferred_agent} onChange={(e) => setForm({ ...form, preferred_agent: e.target.value })} data-testid="sell-preferred-agent" className={`mt-1.5 ${inp}`}>
                <option value="">Nezáleží mi – přidělte mi makléře</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}{a.role ? ` – ${a.role}` : ""}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1.5">Vyberte konkrétního makléře, nebo nechte volbu na nás – vhodného makléře vám rádi přidělíme.</p>
            </div>
            <div>
              <label className={lbl}>Popis nemovitosti / poznámka</label>
              <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Stručně popište nemovitost, stav, počet místností…" data-testid="sell-message" className={`mt-1.5 ${inp} resize-none`} />
            </div>
            <button type="submit" disabled={sending} data-testid="sell-submit-btn" className="inline-flex items-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] disabled:opacity-60 text-white font-bold py-4 px-8 uppercase tracking-wider transition-colors">
              <Send size={18} /> {sending ? "Odesílání…" : "Odeslat poptávku"}
            </button>
          </form>
        </div>

        {/* Benefits */}
        <aside className="space-y-6">
          {[
            { icon: TrendingUp, title: "Nejvyšší cena na trhu", text: "Profesionální marketing a vyjednávání pro maximální výnos z prodeje." },
            { icon: ShieldCheck, title: "Bezpečnost transakce", text: "Právní servis, ověřené smlouvy a advokátní úschova peněz." },
            { icon: Clock, title: "Ušetříme váš čas", text: "Postaráme se o prohlídky, inzerci i administrativu za vás." },
          ].map((b, i) => (
            <div key={i} className="border border-gray-200 p-6" data-testid={`sell-benefit-${i}`}>
              <b.icon className="text-[#003DA5] mb-3" size={26} />
              <h3 className="font-display font-bold text-lg text-[#0A0A0A]">{b.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{b.text}</p>
            </div>
          ))}
        </aside>
      </section>
    </div>
  );
}
