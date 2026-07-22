import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, TrendingUp, ShieldCheck, Clock, Ruler } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PROPERTY_TYPES } from "@/lib/format";
import { PageHero, Reveal } from "@/components/motion";

const INTEREST = {
  prodej: "Prodej",
  pronajem: "Pronájem",
  odhad: "Odhad nemovitosti",
};

export default function Sell() {
  const [searchParams] = useSearchParams();
  const initialType = ["prodej", "pronajem", "odhad"].includes(searchParams.get("typ"))
    ? searchParams.get("typ")
    : "prodej";

  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", deal_type: initialType, property_type: "byt",
    location: "", area: "", message: "", preferred_agent: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/agents").then((r) => setAgents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const typ = searchParams.get("typ");
    if (["prodej", "pronajem", "odhad"].includes(typ)) {
      setForm((f) => ({ ...f, deal_type: typ }));
    }
  }, [searchParams]);

  const isOdhad = form.deal_type === "odhad";

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
      subject: isOdhad ? "Poptávka: Odhad nemovitosti" : `Poptávka: ${INTEREST[form.deal_type]} nemovitosti`,
      message:
        `Mám zájem o: ${INTEREST[form.deal_type]}\n` +
        `Typ nemovitosti: ${PROPERTY_TYPES[form.property_type]}\n` +
        `Lokalita: ${form.location || "-"}\n` +
        `Plocha: ${form.area ? form.area + " m²" : "-"}\n` +
        `Preferovaný makléř: ${agentName}\n\n` +
        `Popis / poznámka:\n${form.message || "-"}`,
    };
    try {
      await api.post("/contact", body);
      toast.success(isOdhad
        ? "Děkujeme! Připravíme vám nezávazný odhad ceny a ozveme se."
        : "Děkujeme! Ozveme se vám co nejdříve s nezávaznou nabídkou.");
      setForm({ name: "", email: "", phone: "", deal_type: form.deal_type, property_type: "byt", location: "", area: "", message: "", preferred_agent: "" });
    } catch {
      toast.error("Odeslání se nezdařilo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition";
  const lbl = "text-xs font-bold uppercase tracking-wider text-[#0A0A0A]";

  return (
    <div data-testid="sell-page">
      <PageHero
        eyebrow="Prodej · Pronájem · Odhad"
        title={isOdhad ? "Zjistěte cenu své nemovitosti zdarma" : "Prodejte nebo pronajměte nemovitost s námi"}
        subtitle="Vyplňte krátký formulář a my vám připravíme nezávazné tržní ocenění zdarma. O celý proces se postaráme za vás – rychle, bezpečně a s osobním přístupem."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <Reveal className="lg:col-span-2">
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
                    {Object.entries(INTEREST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
              <button type="submit" disabled={sending} data-testid="sell-submit-btn" className="inline-flex items-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] disabled:opacity-60 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-red-900/20 hover:scale-[1.03] transition-transform">
                <Send size={18} /> {sending ? "Odesílání…" : isOdhad ? "Chci odhad zdarma" : "Odeslat poptávku"}
              </button>
            </form>
          </Reveal>

          {/* Benefits */}
          <aside className="space-y-6">
            {[
              { icon: Ruler, title: "Odhad ceny zdarma", text: "Nezávazně vám určíme reálnou tržní cenu vaší nemovitosti." },
              { icon: TrendingUp, title: "Nejvyšší cena na trhu", text: "Profesionální marketing a vyjednávání pro maximální výnos z prodeje." },
              { icon: ShieldCheck, title: "Bezpečnost transakce", text: "Právní servis, ověřené smlouvy a advokátní úschova peněz." },
              { icon: Clock, title: "Ušetříme váš čas", text: "Postaráme se o prohlídky, inzerci i administrativu za vás." },
            ].map((b, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:-translate-y-1 hover:shadow-[0_14px_44px_rgb(0,0,0,0.08)] transition duration-300" data-testid={`sell-benefit-${i}`}>
                  <b.icon className="text-[#003DA5] mb-3" size={26} />
                  <h3 className="font-display font-bold text-lg text-[#0A0A0A]">{b.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </aside>
        </div>
      </section>
    </div>
  );
}
