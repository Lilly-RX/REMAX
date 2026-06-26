import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/format";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [deal, setDeal] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (deal) params.deal_type = deal;
    if (type) params.property_type = type;
    api.get("/properties", { params }).then((r) => {
      setProperties(r.data);
      setLoading(false);
    });
  }, [deal, type]);

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
        </div>

        <div className="mt-10">
          {loading ? (
            <p className="text-gray-500">Načítání…</p>
          ) : properties.length === 0 ? (
            <p className="text-gray-500" data-testid="properties-empty">Žádné nemovitosti neodpovídají filtru.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="properties-grid">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
