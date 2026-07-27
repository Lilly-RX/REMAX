import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Users, MessageSquare, LogOut, LayoutGrid, ExternalLink, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PropertiesPanel } from "./PropertiesPanel";
import { AgentsPanel } from "./AgentsPanel";
import { MessagesPanel } from "./MessagesPanel";
import { ReviewsPanel } from "./ReviewsPanel";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const loadStats = () => api.get("/stats").then((r) => setStats(r.data)).catch(() => {});
  const loadSyncStatus = () => api.get("/admin/maxis/status").then((r) => setSyncStatus(r.data)).catch(() => {});
  useEffect(() => { loadStats(); loadSyncStatus(); }, [tab]);

  const runSync = async () => {
    setSyncing(true);
    try {
      const r = await api.post("/admin/maxis/sync");
      toast.success(`Synchronizace hotová: +${r.data.added} nových, ${r.data.updated} aktualizováno, ${r.data.removed} odebráno`);
      setSyncStatus(r.data);
      loadStats();
    } catch (e) {
      toast.error("Synchronizace selhala. Zkuste to prosím znovu.");
    } finally {
      setSyncing(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "nikdy";
    try { return new Date(iso).toLocaleString("cs-CZ", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return iso; }
  };

  const NAV = [
    { id: "overview", label: "Přehled", icon: LayoutGrid },
    { id: "properties", label: "Nemovitosti", icon: Building },
    { id: "agents", label: "Makléři", icon: Users },
    { id: "messages", label: "Zprávy", icon: MessageSquare, badge: stats?.unread_messages },
    { id: "reviews", label: "Recenze", icon: Star, badge: stats?.pending_reviews },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex fixed inset-y-0">
        <div className="p-5 border-b border-gray-200"><Logo /></div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              data-testid={`admin-tab-${n.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                tab === n.id ? "bg-[#003DA5] text-white" : "text-[#0A0A0A] hover:bg-gray-100"
              }`}
            >
              <n.icon size={18} /> {n.label}
              {n.badge > 0 && <span className="ml-auto bg-[#DC1C2E] text-white text-xs px-1.5 py-0.5 rounded-full">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100"><ExternalLink size={18} /> Zobrazit web</a>
          <button onClick={handleLogout} data-testid="admin-logout-btn" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#DC1C2E] hover:bg-red-50"><LogOut size={18} /> Odhlásit se</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4"><Logo /><button onClick={handleLogout} className="text-[#DC1C2E]" data-testid="admin-logout-mobile"><LogOut size={20} /></button></div>
        <div className="flex overflow-x-auto scrollbar-hide border-t border-gray-100">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`flex-shrink-0 px-4 py-3 text-xs font-bold ${tab === n.id ? "text-[#003DA5] border-b-2 border-[#003DA5]" : "text-gray-500"}`}>{n.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-64 p-5 md:p-10 pt-32 md:pt-10">
        {tab === "overview" && (
          <div data-testid="admin-overview">
            <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Vítejte, {user?.name}</h1>
            <p className="text-gray-500 mt-1">Přehled vaší realitní kanceláře</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {[
                { label: "Nemovitosti", value: stats?.properties, icon: Building, color: "#003DA5" },
                { label: "Makléři", value: stats?.agents, icon: Users, color: "#003DA5" },
                { label: "Zprávy celkem", value: stats?.messages, icon: MessageSquare, color: "#0A0A0A" },
                { label: "Nepřečtené zprávy", value: stats?.unread_messages, icon: MessageSquare, color: "#DC1C2E" },
                { label: "Recenze", value: stats?.reviews, icon: Star, color: "#003DA5" },
                { label: "Recenze ke schválení", value: stats?.pending_reviews, icon: Star, color: "#DC1C2E" },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-gray-200 p-6" data-testid={`overview-stat-${i}`}>
                  <s.icon size={22} style={{ color: s.color }} />
                  <div className="font-display text-3xl font-black mt-3" style={{ color: s.color }}>{s.value ?? "–"}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* MAXIS sync */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6" data-testid="maxis-sync-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-[#003DA5]" />
                    <h2 className="font-display text-lg font-bold text-[#0A0A0A]">Synchronizace nabídek (MAXIS)</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Nabídky se automaticky aktualizují 1× týdně z RE/MAX. Můžete je také synchronizovat ručně.
                  </p>
                  <p className="text-xs text-gray-400 mt-2" data-testid="maxis-last-sync">
                    Poslední synchronizace: <span className="font-semibold text-gray-600">{fmtDate(syncStatus?.last_sync)}</span>
                    {syncStatus?.last_sync && (
                      <> · {syncStatus.total} nabídek na webu</>
                    )}
                  </p>
                </div>
                <button
                  onClick={runSync}
                  disabled={syncing}
                  data-testid="maxis-sync-btn"
                  className="inline-flex items-center justify-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] disabled:opacity-60 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-red-900/20 transition whitespace-nowrap"
                >
                  <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Synchronizuji…" : "Synchronizovat teď"}
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === "properties" && <PropertiesPanel />}
        {tab === "agents" && <AgentsPanel />}
        {tab === "messages" && <MessagesPanel />}
        {tab === "reviews" && <ReviewsPanel />}
      </main>
    </div>
  );
}
