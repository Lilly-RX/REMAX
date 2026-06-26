import { useEffect, useState } from "react";
import { Mail, Phone, Trash2, Check, Circle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export const MessagesPanel = () => {
  const [messages, setMessages] = useState([]);

  const load = () => api.get("/messages").then((r) => setMessages(r.data));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/messages/${id}/read`);
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Smazat zprávu?")) return;
    await api.delete(`/messages/${id}`);
    toast.success("Smazáno");
    load();
  };

  return (
    <div data-testid="admin-messages-panel">
      <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-6">Zprávy ({messages.length})</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500" data-testid="messages-empty">Zatím žádné zprávy.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`bg-white border p-5 ${m.is_read ? "border-gray-200" : "border-[#003DA5] border-l-4"}`} data-testid={`message-${m.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!m.is_read && <Circle size={8} className="fill-[#DC1C2E] text-[#DC1C2E]" />}
                    <span className="font-bold text-[#0A0A0A]">{m.name}</span>
                    <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString("cs-CZ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-[#003DA5]"><Mail size={14} /> {m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-[#003DA5]"><Phone size={14} /> {m.phone}</a>}
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-line">{m.message}</p>
                  {m.property_id && <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1">K nemovitosti</span>}
                </div>
                <div className="flex flex-col gap-2">
                  {!m.is_read && <button onClick={() => markRead(m.id)} data-testid={`mark-read-${m.id}`} className="text-[#003DA5] p-1.5 hover:bg-blue-50" title="Označit jako přečtené"><Check size={18} /></button>}
                  <button onClick={() => remove(m.id)} data-testid={`delete-message-${m.id}`} className="text-[#DC1C2E] p-1.5 hover:bg-red-50"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
