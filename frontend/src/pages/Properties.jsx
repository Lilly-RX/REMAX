import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/format";
import { PageHero, Reveal } from "@/components/motion";

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [deal, setDeal] = useState(searchParams.get("deal") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("pmin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("pmax") || "");
  const [sort, setSort] = useState("newest");
  const PER_PAGE = 12;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = {};
    if (deal) params.deal_type = deal;
    if (type) params.property_type = type;
    api.get("/properties", { params }).then((r) => {
      setProperties(r.data);
      setLoading(false);
    });
  }, [deal, type]);

  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = properties.filter((p) => {
    if (locationQuery && !norm(p.location).includes(norm(locationQuery))) return false;
    if (priceMin && p.price < Number(priceMin)) return false;
    if (priceMax && p.price > Number(priceMax)) return false;
    return true;
  });

  useEffect(() => {
    setPage(1);
  }, [locationQuery, priceMin, priceMax, sort]);

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.price || 0) - (b.price || 0);
      case "price_desc":
        return (b.price || 0) - (a.price || 0);
      case "oldest":
        return String(a.created_at || "").localeCompare(String(b.created_at || ""));
      case "newest":
      default:
        return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    }
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const resetSearch = () => {
    setLocationQuery("");
    setPriceMin("");
    setPriceMax("");
  };

  const FilterBtn = ({ active, onClick, children, testid }) => (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-full transition-colors border ${
        active ? "bg-[#003DA5] text-white border-[#003DA5]" : "bg-white text-[#0A0A0A] border-gray-300 hover:border-[#003DA5]"
      }`}
    >
      {children}
    </button>
  );

  const searchInp = "mt-1.5 w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition";

  return (
    <div data-testid="properties-page">
      <PageHero
        eyebrow="Nabídka"
        title="Nemovitosti"
        subtitle="Prohlédněte si aktuální nabídku bytů, domů, pozemků a komerčních prostor na Tachovsku."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <FilterBtn active={deal === ""} onClick={() => setDeal("")} testid="filter-deal-all">Vše</FilterBtn>
              {Object.entries(DEAL_TYPES).map(([k, v]) => (
                <FilterBtn key={k} active={deal === k} onClick={() => setDeal(k)} testid={`filter-deal-${k}`}>{v}</FilterBtn>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterBtn active={type === ""} onClick={() => setType("")} testid="filter-type-all">Všechny typy</FilterBtn>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                <FilterBtn key={k} active={type === k} onClick={() => setType(k)} testid={`filter-type-${k}`}>{v}</FilterBtn>
              ))}
            </div>

            {/* Search by location + price */}
            <div className="bg-[#F5F6F8] border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Lokalita</label>
                <input value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="např. Tachov, Planá…" data-testid="search-location" className={searchInp} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Cena od</label>
                <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" data-testid="search-price-min" className={searchInp} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Cena do</label>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="bez limitu" data-testid="search-price-max" className={searchInp} />
              </div>
              {(locationQuery || priceMin || priceMax) && (
                <button onClick={resetSearch} data-testid="search-reset" className="md:col-span-4 justify-self-start text-sm font-bold text-[#DC1C2E] hover:underline">
                  Zrušit vyhledávání ✕
                </button>
              )}
            </div>
          </div>

          <div className="mt-10">
            {loading ? (
              <p className="text-gray-500">Načítání…</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500" data-testid="properties-empty">Žádné nemovitosti neodpovídají filtru.</p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <p className="text-sm text-gray-500" data-testid="properties-count">
                    Zobrazeno {paged.length} z {sorted.length} nemovitostí
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Řadit:</label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      data-testid="properties-sort"
                      className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition"
                    >
                      <option value="newest">Nejnovější</option>
                      <option value="oldest">Nejstarší</option>
                      <option value="price_asc">Cena: od nejnižší</option>
                      <option value="price_desc">Cena: od nejvyšší</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="properties-grid">
                  {paged.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.06}>
                      <PropertyCard property={p} />
                    </Reveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12" data-testid="pagination">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} data-testid="page-prev" className="px-4 py-2 text-sm font-bold border border-gray-300 rounded-full disabled:opacity-40 hover:border-[#003DA5] transition-colors">
                      ← Předchozí
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setPage(n)} data-testid={`page-${n}`} className={`w-10 h-10 text-sm font-bold border rounded-xl transition-colors ${
                        page === n ? "bg-[#003DA5] text-white border-[#003DA5]" : "border-gray-300 hover:border-[#003DA5]"
                      }`}>
                        {n}
                      </button>
                    ))}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} data-testid="page-next" className="px-4 py-2 text-sm font-bold border border-gray-300 rounded-full disabled:opacity-40 hover:border-[#003DA5] transition-colors">
                      Další →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
