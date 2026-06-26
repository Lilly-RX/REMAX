import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api, { mediaUrl } from "@/lib/api";
import { ImageUploader } from "./ImageUploader";

const EMPTY = { name: "", role: "Realitní makléř", bio: "", phone: "", email: "", photo_url: "", order: 0 };

export const AgentsPanel = () => {
  const [agents, setAgents] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/agents").then((r) => setAgents(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...editing, order: Number(editing.order) || 0 };
    try {
      if (editing.id) await api.put(`/agents/${editing.id}`, payload);
      else await api.post("/agents", payload);
      toast.success("Uloženo");
      setEditing(null);
      load();
    } catch {
      toast.error("Uložení selhalo");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Opravdu smazat tohoto makléře?")) return;
    await api.delete(`/agents/${id}`);
    toast.success("Smazáno");
    load();
  };

  const inp = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]";

  return (
    <div data-testid="admin-agents-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Makléři ({agents.length})</h2>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="add-agent-btn" className="inline-flex items-center gap-2 bg-[#003DA5] hover:bg-[#002b75] text-white font-bold px-4 py-2.5 text-sm uppercase tracking-wider transition-colors">
          <Plus size={16} /> Přidat makléře
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((a) => (
          <div key={a.id} className="bg-white border border-gray-200 overflow-hidden" data-testid={`admin-agent-card-${a.id}`}>
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              {a.photo_url && <img src={mediaUrl(a.photo_url)} alt={a.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="font-bold text-[#0A0A0A]">{a.name}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#DC1C2E]">{a.role}</div>
              <div className="text-xs text-gray-500 mt-1">{a.email}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing({ ...EMPTY, ...a })} data-testid={`edit-agent-${a.id}`} className="flex-1 inline-flex items-center justify-center gap-1 border border-gray-300 hover:border-[#003DA5] text-sm font-bold py-1.5"><Pencil size={14} /> Upravit</button>
                <button onClick={() => remove(a.id)} data-testid={`delete-agent-${a.id}`} className="text-[#DC1C2E] border border-gray-300 hover:border-[#DC1C2E] px-2"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4" data-testid="agent-modal">
          <form onSubmit={save} className="bg-white w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">{editing.id ? "Upravit" : "Nový"} makléř</h3>
              <button type="button" onClick={() => setEditing(null)} data-testid="close-agent-modal"><X /></button>
            </div>
            <div><label className="text-xs font-bold uppercase tracking-wider">Jméno</label><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="agent-name" className={`mt-1.5 ${inp}`} /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider">Pozice</label><input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} data-testid="agent-role" className={`mt-1.5 ${inp}`} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase tracking-wider">Telefon</label><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} data-testid="agent-phone" className={`mt-1.5 ${inp}`} /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider">Pořadí</label><input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} className={`mt-1.5 ${inp}`} /></div>
            </div>
            <div><label className="text-xs font-bold uppercase tracking-wider">E-mail</label><input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} data-testid="agent-email" className={`mt-1.5 ${inp}`} /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider">Bio</label><textarea rows={3} value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} data-testid="agent-bio" className={`mt-1.5 ${inp} resize-none`} /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider">Fotografie</label><div className="mt-1.5"><ImageUploader images={editing.photo_url ? [editing.photo_url] : []} multiple={false} onChange={(imgs) => setEditing({ ...editing, photo_url: imgs[0] || "" })} testid="agent-uploader" /></div></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" data-testid="save-agent-btn" className="bg-[#003DA5] hover:bg-[#002b75] text-white font-bold px-6 py-3 uppercase tracking-wider text-sm">Uložit</button>
              <button type="button" onClick={() => setEditing(null)} className="border border-gray-300 font-bold px-6 py-3 uppercase tracking-wider text-sm">Zrušit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
