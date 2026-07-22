import { useEffect, useState } from "react";
import { Send, MessageSquareQuote, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { StarRating, StarInput } from "@/components/StarRating";
import { DEAL_LABELS, DEAL_OPTIONS } from "@/lib/reviewMeta";
import { PageHero, Reveal } from "@/components/motion";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [agents, setAgents] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    author_name: "", email: "", rating: 5, text: "",
    target_type: "office", agent_id: "", deal_type: "",
  });

  const load = () => api.get("/reviews").then((r) => setReviews(r.data));
  useEffect(() => {
    load();
    api.get("/agents").then((r) => setAgents(r.data));
  }, []);

  const agentName = (id) => agents.find((a) => a.id === id)?.name || "Makléř";

  const submit = async (e) => {
    e.preventDefault();
    if (form.target_type === "agent" && !form.agent_id) {
      toast.error("Vyberte prosím makléře.");
      return;
    }
    setSending(true);
    try {
      const res = await api.post("/reviews", {
        ...form,
        agent_id: form.target_type === "agent" ? form.agent_id : null,
      });
      toast.success(res.data.message);
      setForm({ author_name: "", email: "", rating: 5, text: "", target_type: "office", agent_id: "", deal_type: "" });
    } catch {
      toast.error("Recenzi se nepodařilo odeslat.");
    } finally {
      setSending(false);
    }
  };

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition";
  const lbl = "text-xs font-bold uppercase tracking-wider text-[#0A0A0A]";
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div data-testid="reviews-page">
      <PageHero eyebrow="Recenze klientů" title="Co o nás říkají klienti">
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 mt-6" data-testid="reviews-avg">
            <StarRating value={avg} size={22} />
            <span className="text-lg font-bold">{avg.toFixed(1)} / 5</span>
            <span className="text-gray-400">({reviews.length} recenzí)</span>
          </div>
        )}
      </PageHero>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* List */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Recenze</h2>
            {reviews.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500" data-testid="reviews-empty">
                <MessageSquareQuote className="mx-auto mb-3 text-gray-300" size={40} />
                Zatím zde nejsou žádné recenze. Buďte první, kdo napíše hodnocení!
              </div>
            ) : (
              reviews.map((r, i) => (
                <Reveal key={r.id} delay={(i % 4) * 0.05}>
                  <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6" data-testid={`review-${r.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-[#0A0A0A]">{r.author_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {r.target_type === "agent" ? `Makléř: ${agentName(r.agent_id)}` : "Kancelář RE/MAX Active Broker"}
                          {r.deal_type && ` · ${DEAL_LABELS[r.deal_type] || r.deal_type}`}
                        </div>
                      </div>
                      <StarRating value={r.rating} size={16} />
                    </div>
                    <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-line">{r.text}</p>
                    <div className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString("cs-CZ")}</div>
                    {r.reply && (
                      <div className="mt-4 bg-[#F5F6F8] border-l-4 border-[#003DA5] rounded-r-xl p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#003DA5]">
                          <CornerDownRight size={14} /> Odpověď RE/MAX Active Broker
                        </div>
                        <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-line">{r.reply}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))
            )}
          </div>

          {/* Form */}
          <aside className="lg:col-span-2">
            <div className="bg-[#F5F6F8] border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-bold text-[#0A0A0A]">Napište recenzi</h2>
              <p className="text-sm text-gray-500 mt-1 mb-5">Recenze se zobrazí po schválení naší kanceláří.</p>
              <form onSubmit={submit} className="space-y-4" data-testid="review-form">
                <div>
                  <label className={lbl}>Vaše hodnocení *</label>
                  <div className="mt-2">
                    <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Komu recenzi píšete? *</label>
                  <select value={form.target_type} onChange={(e) => setForm({ ...form, target_type: e.target.value })} data-testid="review-target" className={`mt-1.5 ${inp}`}>
                    <option value="office">Kanceláři jako celku</option>
                    <option value="agent">Konkrétnímu makléři</option>
                  </select>
                </div>
                {form.target_type === "agent" && (
                  <div>
                    <label className={lbl}>Makléř *</label>
                    <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} data-testid="review-agent" className={`mt-1.5 ${inp}`}>
                      <option value="">— vyberte makléře —</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className={lbl}>Typ obchodu</label>
                  <select value={form.deal_type} onChange={(e) => setForm({ ...form, deal_type: e.target.value })} data-testid="review-deal" className={`mt-1.5 ${inp}`}>
                    <option value="">— nevybráno —</option>
                    {DEAL_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Jméno *</label>
                  <input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} data-testid="review-name" className={`mt-1.5 ${inp}`} />
                </div>
                <div>
                  <label className={lbl}>E-mail (nepovinné)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="review-email" className={`mt-1.5 ${inp}`} />
                </div>
                <div>
                  <label className={lbl}>Vaše recenze *</label>
                  <textarea required rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} data-testid="review-text" className={`mt-1.5 ${inp} resize-none`} />
                </div>
                <button type="submit" disabled={sending} data-testid="review-submit-btn" className="w-full inline-flex items-center justify-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] disabled:opacity-60 text-white font-bold py-3 rounded-full shadow-lg shadow-red-900/20 hover:scale-[1.02] transition-transform">
                  <Send size={16} /> {sending ? "Odesílání…" : "Odeslat recenzi"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
