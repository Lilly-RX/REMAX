import { useEffect, useState } from "react";
import { Check, Trash2, CornerDownRight, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { StarRating } from "@/components/StarRating";
import { DEAL_LABELS } from "@/lib/reviewMeta";

export const ReviewsPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");

  const load = () => api.get("/reviews/all").then((r) => setReviews(r.data));
  useEffect(() => {
    load();
    api.get("/agents").then((r) => setAgents(r.data));
  }, []);

  const agentName = (id) => agents.find((a) => a.id === id)?.name || "Makléř";

  const approve = async (id) => { await api.put(`/reviews/${id}/approve`); toast.success("Schváleno"); load(); };
  const remove = async (id) => {
    if (!window.confirm("Opravdu smazat tuto recenzi?")) return;
    await api.delete(`/reviews/${id}`); toast.success("Smazáno"); load();
  };
  const saveReply = async (id) => {
    await api.put(`/reviews/${id}/reply`, { reply: replyText });
    toast.success("Odpověď uložena");
    setReplyOpen(null); setReplyText(""); load();
  };

  const shown = reviews.filter((r) => filter === "all" ? true : r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const Tab = ({ id, label, badge }) => (
    <button onClick={() => setFilter(id)} data-testid={`reviews-filter-${id}`}
      className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border transition-colors ${filter === id ? "bg-[#003DA5] text-white border-[#003DA5]" : "bg-white border-gray-300 hover:border-[#003DA5]"}`}>
      {label}{badge > 0 && <span className="ml-2 bg-[#DC1C2E] text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
  );

  return (
    <div data-testid="admin-reviews-panel">
      <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-6">Recenze ({reviews.length})</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        <Tab id="pending" label="Ke schválení" badge={pendingCount} />
        <Tab id="approved" label="Schválené" />
        <Tab id="all" label="Vše" />
      </div>

      {shown.length === 0 ? (
        <p className="text-gray-500" data-testid="admin-reviews-empty">Žádné recenze v této kategorii.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((r) => (
            <div key={r.id} className={`bg-white border p-5 ${r.status === "pending" ? "border-[#DC1C2E] border-l-4" : "border-gray-200"}`} data-testid={`admin-review-${r.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0A0A0A]">{r.author_name}</span>
                    <StarRating value={r.rating} size={14} />
                    {r.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-[#DC1C2E]/10 text-[#DC1C2E] font-bold px-2 py-0.5"><Clock size={11} /> Čeká</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5">Zveřejněno</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.target_type === "agent" ? `Makléř: ${agentName(r.agent_id)}` : "Kancelář"}
                    {r.deal_type && ` · ${DEAL_LABELS[r.deal_type] || r.deal_type}`}
                    {r.email && ` · ${r.email}`}
                    {` · ${new Date(r.created_at).toLocaleDateString("cs-CZ")}`}
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-line">{r.text}</p>
                  {r.reply && (
                    <div className="mt-3 bg-[#F9FAFB] border-l-4 border-[#003DA5] p-3">
                      <div className="flex items-center gap-1 text-xs font-bold uppercase text-[#003DA5]"><CornerDownRight size={12} /> Vaše odpověď</div>
                      <p className="text-sm text-gray-700 mt-1">{r.reply}</p>
                    </div>
                  )}
                  {replyOpen === r.id && (
                    <div className="mt-3">
                      <textarea rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} data-testid={`reply-text-${r.id}`} placeholder="Napište odpověď na recenzi…" className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#003DA5] resize-none" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveReply(r.id)} data-testid={`reply-save-${r.id}`} className="inline-flex items-center gap-1 bg-[#003DA5] text-white text-sm font-bold px-3 py-1.5"><Send size={13} /> Uložit odpověď</button>
                        <button onClick={() => { setReplyOpen(null); setReplyText(""); }} className="text-sm font-bold px-3 py-1.5 border border-gray-300">Zrušit</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {r.status === "pending" && (
                    <button onClick={() => approve(r.id)} data-testid={`approve-review-${r.id}`} className="text-green-600 p-1.5 hover:bg-green-50" title="Schválit"><Check size={18} /></button>
                  )}
                  <button onClick={() => { setReplyOpen(r.id); setReplyText(r.reply || ""); }} data-testid={`reply-review-${r.id}`} className="text-[#003DA5] p-1.5 hover:bg-blue-50" title="Odpovědět"><CornerDownRight size={18} /></button>
                  <button onClick={() => remove(r.id)} data-testid={`delete-review-${r.id}`} className="text-[#DC1C2E] p-1.5 hover:bg-red-50" title="Smazat"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
