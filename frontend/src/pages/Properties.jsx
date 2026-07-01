import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/format";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [deal, setDeal] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [locationQuery, setLocationQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
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
  }, [locationQuery, priceMin, priceMax]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
      className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border ${
        active ? "bg-[#003DA5] text-white border-[#003DA5]" : "bg-white text-[#0A0A0A] border-gray-300 hover:border-[#003DA5]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div data-testid="properties-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">Nabídka</span>
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-[#0A0A0A] mt-3">
          Nemovitosti
        </h1>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4">
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
          <div className="bg-[#F9FAFB] border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Lokalita</label>
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="např. Tachov, Planá…"
                data-testid="search-location"
                className="mt-1.5 w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Cena od</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                data-testid="search-price-min"
                className="mt-1.5 w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Cena do</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="bez limitu"
                data-testid="search-price-max"
                className="mt-1.5 w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]"
              />
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
              <p className="text-sm text-gray-500 mb-6" data-testid="properties-count">
                Zobrazeno {paged.length} z {filtered.length} nemovitostí
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="properties-grid">
                {paged.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12" data-testid="pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="page-prev"
                    className="px-4 py-2 text-sm font-bold border border-gray-300 disabled:opacity-40 hover:border-[#003DA5] transition-colors"
                  >
                    ← Předchozí
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      data-testid={`page-${n}`}
                      className={`w-10 h-10 text-sm font-bold border transition-colors ${
                        page === n ? "bg-[#003DA5] text-white border-[#003DA5]" : "border-gray-300 hover:border-[#003DA5]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="page-next"
                    className="px-4 py-2 text-sm font-bold border border-gray-300 disabled:opacity-40 hover:border-[#003DA5] transition-colors"
                  >
                    Další →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
