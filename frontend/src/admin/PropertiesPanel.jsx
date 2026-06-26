import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { ImageUploader } from "./ImageUploader";
import { formatPrice, PROPERTY_TYPES, DEAL_TYPES, STATUS_LABELS } from "@/lib/format";

const EMPTY = {
  title: "", description: "", price: 0, currency: "Kč", deal_type: "prodej",
  property_type: "byt", status: "aktivni", location: "", bedrooms: 0,
  bathrooms: 0, area: 0, images: [], featured: false, agent_id: "",
};

export const PropertiesPanel = () => {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/properties").then((r) => setProperties(r.data));
  useEffect(() => {
    load();
    api.get("/agents").then((r) => setAgents(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...editing };
    ["price", "bedrooms", "bathrooms", "area"].forEach((k) => (payload[k] = Number(payload[k]) || 0));
    if (!payload.agent_id) payload.agent_id = null;
    try {
      if (editing.id) await api.put(`/properties/${editing.id}`, payload);
      else await api.post("/properties", payload);
      toast.success("Uloženo");
      setEditing(null);
      load();
    } catch {
      toast.error("Uložení selhalo");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Opravdu smazat tuto nemovitost?")) return;
    await api.delete(`/properties/${id}`);
    toast.success("Smazáno");
    load();
  };

  const F = (label, child) => (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{label}</label>
      <div className="mt-1.5">{child}</div>
    </div>
  );
  const inp = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]";

  return (
    <div data-testid="admin-properties-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Nemovitosti ({properties.length})</h2>
        <button onClick={() => setEditing({ ...EMPTY })} data-testid="add-property-btn" className="inline-flex items-center gap-2 bg-[#003DA5] hover:bg-[#002b75] text-white font-bold px-4 py-2.5 text-sm uppercase tracking-wider transition-colors">
          <Plus size={16} /> Přidat nemovitost
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] border-b border-gray-200">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider">Nemovitost</th>
              <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider hidden md:table-cell">Typ</th>
              <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider">Cena</th>
              <th className="px-4 py-3 font-bold uppercase text-xs tracking-wider hidden md:table-cell">Stav</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`admin-property-row-${p.id}`}>
                <td className="px-4 py-3">
                  <div className="font-bold text-[#0A0A0A]">{p.title}</div>
                  <div className="text-gray-500 text-xs">{p.location}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{PROPERTY_TYPES[p.property_type]} · {DEAL_TYPES[p.deal_type]}</td>
                <td className="px-4 py-3 font-bold text-[#003DA5]">{formatPrice(p.price, p.currency, p.deal_type)}</td>
                <td className="px-4 py-3 hidden md:table-cell">{STATUS_LABELS[p.status]}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing({ ...EMPTY, ...p, agent_id: p.agent_id || "" })} data-testid={`edit-property-${p.id}`} className="text-[#003DA5] p-1.5 hover:bg-blue-50"><Pencil size={16} /></button>
                  <button onClick={() => remove(p.id)} data-testid={`delete-property-${p.id}`} className="text-[#DC1C2E] p-1.5 hover:bg-red-50"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4" data-testid="property-modal">
          <form onSubmit={save} className="bg-white w-full max-w-2xl my-8 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">{editing.id ? "Upravit" : "Nová"} nemovitost</h3>
              <button type="button" onClick={() => setEditing(null)} data-testid="close-property-modal"><X /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">{F("Název", <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} data-testid="prop-title" className={inp} />)}</div>
              {F("Lokalita", <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} data-testid="prop-location" className={inp} />)}
              {F("Cena (Kč)", <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} data-testid="prop-price" className={inp} />)}
              {F("Typ obchodu", <select value={editing.deal_type} onChange={(e) => setEditing({ ...editing, deal_type: e.target.value })} data-testid="prop-deal-type" className={inp}>{Object.entries(DEAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>)}
              {F("Typ nemovitosti", <select value={editing.property_type} onChange={(e) => setEditing({ ...editing, property_type: e.target.value })} data-testid="prop-type" className={inp}>{Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>)}
              {F("Pokoje", <input type="number" value={editing.bedrooms} onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value })} className={inp} />)}
              {F("Koupelny", <input type="number" value={editing.bathrooms} onChange={(e) => setEditing({ ...editing, bathrooms: e.target.value })} className={inp} />)}
              {F("Plocha (m²)", <input type="number" value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} className={inp} />)}
              {F("Stav", <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} data-testid="prop-status" className={inp}>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>)}
              {F("Makléř", <select value={editing.agent_id} onChange={(e) => setEditing({ ...editing, agent_id: e.target.value })} className={inp}><option value="">— žádný —</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>)}
              <div className="sm:col-span-2">{F("Popis", <textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} data-testid="prop-description" className={`${inp} resize-none`} />)}</div>
              <div className="sm:col-span-2">{F("Fotografie", <ImageUploader images={editing.images} onChange={(images) => setEditing({ ...editing, images })} testid="prop-uploader" />)}</div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} data-testid="prop-featured" /> Zobrazit na úvodní stránce (doporučené)</label>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" data-testid="save-property-btn" className="bg-[#003DA5] hover:bg-[#002b75] text-white font-bold px-6 py-3 uppercase tracking-wider text-sm">Uložit</button>
              <button type="button" onClick={() => setEditing(null)} className="border border-gray-300 font-bold px-6 py-3 uppercase tracking-wider text-sm">Zrušit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
