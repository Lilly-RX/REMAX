import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHero, Reveal } from "@/components/motion";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Zpráva byla odeslána. Brzy se vám ozveme.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Zprávu se nepodařilo odeslat.");
    } finally {
      setSending(false);
    }
  };

  const inp = "mt-1.5 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition";
  const lbl = "text-xs font-bold uppercase tracking-wider text-[#0A0A0A]";

  return (
    <div data-testid="contact-page">
      <PageHero
        eyebrow="Kontakt"
        title="Spojte se s námi"
        subtitle="Máte dotaz nebo chcete prodat či pronajmout nemovitost? Napište nám nebo se zastavte v naší kanceláři v Tachově."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <Reveal>
              <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Jméno *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Telefon</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone" className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>E-mail *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Zpráva *</label>
                  <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" className={`${inp} resize-none`} />
                </div>
                <button type="submit" disabled={sending} data-testid="contact-submit-btn" className="inline-flex items-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] disabled:opacity-60 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-red-900/20 hover:scale-[1.03] transition-transform">
                  <Send size={18} /> {sending ? "Odesílání…" : "Odeslat zprávu"}
                </button>
              </form>
            </Reveal>

            {/* Info + map */}
            <Reveal delay={0.1}>
              <div className="space-y-6">
                <div className="bg-[#F5F6F8] border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[#003DA5] mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0A0A0A]">Adresa kanceláře</div>
                      <p className="text-gray-600 text-sm">Náměstí Republiky 751, 347 01 Tachov</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-[#003DA5] mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0A0A0A]">Telefon</div>
                      <a href="tel:+420371120180" className="text-gray-600 text-sm hover:text-[#003DA5]">+420 371 120 180</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="text-[#003DA5] mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0A0A0A]">E-mail</div>
                      <a href="mailto:activebroker@re-max.cz" className="text-gray-600 text-sm hover:text-[#003DA5] block">activebroker@re-max.cz</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-[#003DA5] mt-0.5" />
                    <div>
                      <div className="font-bold text-[#0A0A0A]">Otevírací doba</div>
                      <p className="text-gray-600 text-sm">Po–Pá: 8:30–17:00 · So–Ne: zavřeno</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-72" data-testid="contact-map">
                  <iframe
                    title="Mapa Tachov"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src="https://maps.google.com/maps?q=N%C3%A1m%C4%9Bst%C3%AD%20Republiky%20751%2C%20347%2001%20Tachov&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
