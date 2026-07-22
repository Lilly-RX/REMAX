import { useEffect, useState } from "react";
import { Phone, Mail } from "lucide-react";
import api, { mediaUrl } from "@/lib/api";
import { StarRating } from "@/components/StarRating";
import { PageHero, Reveal } from "@/components/motion";

export default function Team() {
  const [agents, setAgents] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get("/agents").then((r) => setAgents(r.data));
    api.get("/reviews/summary").then((r) => setSummary(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="team-page">
      <PageHero
        eyebrow="Náš tým"
        title="Lidé, kterým na vás záleží"
        subtitle="Čtyři zkušení makléři připravení pomoci vám s prodejem, koupí i pronájmem nemovitosti."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.08}>
                <div
                  data-testid={`agent-card-${a.id}`}
                  className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_14px_44px_rgb(0,0,0,0.10)] hover:-translate-y-1 transition duration-300 overflow-hidden group h-full"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                    {a.photo_url ? (
                      <img src={mediaUrl(a.photo_url)} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">Bez fotografie</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-[#0A0A0A]">{a.name}</h3>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#DC1C2E] mt-1">{a.role}</p>
                    {summary[a.id] && (
                      <div className="flex items-center gap-2 mt-2" data-testid={`agent-rating-${a.id}`}>
                        <StarRating value={summary[a.id].avg} size={15} />
                        <span className="text-sm font-bold text-[#0A0A0A]">{summary[a.id].avg.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({summary[a.id].count})</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">{a.bio}</p>
                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                      {a.phone && (
                        <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#003DA5] transition-colors">
                          <Phone size={15} className="text-[#003DA5]" /> {a.phone}
                        </a>
                      )}
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#003DA5] break-all transition-colors">
                          <Mail size={15} className="text-[#003DA5]" /> {a.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
