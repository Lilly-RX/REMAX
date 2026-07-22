import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero, Reveal } from "@/components/motion";
import { useFavorites } from "@/context/FavoritesContext";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/properties").then((r) => setAll(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const items = all.filter((p) => favorites.includes(p.id));

  return (
    <div data-testid="favorites-page">
      <PageHero
        eyebrow="Oblíbené"
        title="Vaše oblíbené nemovitosti"
        subtitle="Uložené nabídky máte pěkně na jednom místě – kdykoli se k nim snadno vrátíte."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {loading ? (
            <p className="text-gray-500">Načítání…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16" data-testid="favorites-empty">
              <Heart size={52} className="mx-auto text-gray-200 mb-4" />
              <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Zatím tu nic není</h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Uložte si nabídky kliknutím na srdíčko a najdete je tady pohromadě.
              </p>
              <Link
                to="/nemovitosti"
                data-testid="favorites-browse-btn"
                className="inline-flex items-center gap-2 mt-6 bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-3.5 px-7 rounded-full shadow-lg shadow-red-900/20 hover:scale-[1.03] transition-transform"
              >
                Prohlédnout nabídku <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6" data-testid="favorites-count">
                {items.length} oblíbených {items.length === 1 ? "nemovitost" : items.length < 5 ? "nemovitosti" : "nemovitostí"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.06}>
                    <PropertyCard property={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
