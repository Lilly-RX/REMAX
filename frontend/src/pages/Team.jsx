import { useEffect, useState } from "react";
import { Phone, Mail } from "lucide-react";
import api, { mediaUrl } from "@/lib/api";

export default function Team() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.get("/agents").then((r) => setAgents(r.data));
  }, []);

  return (
    <div data-testid="team-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">Náš tým</span>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-[#0A0A0A] mt-3">
            Lidé, kterým na vás záleží
          </h1>
          <p className="mt-5 text-lg text-gray-600">
            Pět zkušených makléřů připravených pomoci vám s prodejem, koupí i pronájmem nemovitosti.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((a) => (
            <div
              key={a.id}
              data-testid={`agent-card-${a.id}`}
              className="bg-white border border-gray-200 hover:border-[#003DA5] transition-colors duration-300 overflow-hidden group"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                {a.photo_url ? (
                  <img src={mediaUrl(a.photo_url)} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">Bez fotografie</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#0A0A0A]">{a.name}</h3>
                <p className="text-sm font-bold uppercase tracking-wider text-[#DC1C2E] mt-1">{a.role}</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{a.bio}</p>
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  {a.phone && (
                    <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#003DA5]">
                      <Phone size={15} className="text-[#003DA5]" /> {a.phone}
                    </a>
                  )}
                  {a.email && (
                    <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#003DA5] break-all">
                      <Mail size={15} className="text-[#003DA5]" /> {a.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
