import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Home as HomeIcon, Award, Users, MapPin } from "lucide-react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/properties", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F9FAFB] hidden lg:block" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-[#003DA5]/5 rounded-full blur-3xl hidden lg:block" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-[#DC1C2E]/10 text-[#DC1C2E] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 mb-6">
                <MapPin size={14} /> Realitní kancelář v Tachově
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#0A0A0A] leading-[1.05]">
                Váš domov začíná <span className="text-[#003DA5]">u nás</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                Sehraný tým čtyř zkušených makléřů s osobním přístupem a hlubokou znalostí
                tachovského regionu. Prodáme i koupíme vaši nemovitost rychle a bezpečně.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/kontakt"
                  data-testid="hero-cta-contact"
                  className="inline-flex items-center justify-center gap-2 bg-[#003DA5] hover:bg-[#002b75] text-white font-bold py-4 px-8 uppercase tracking-wider transition-colors"
                >
                  Kontaktujte nás <ArrowRight size={18} />
                </Link>
                <Link
                  to="/nemovitosti"
                  data-testid="hero-cta-listings"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#003DA5] text-[#003DA5] hover:bg-[#003DA5] hover:text-white font-bold py-4 px-8 uppercase tracking-wider transition-colors"
                >
                  <Search size={18} /> Prohlédnout nabídku
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-[#DC1C2E] hidden md:block" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-[#003DA5] hidden md:block" />
              <img
                src="/team-hero.png"
                alt="Tým RE/MAX Active Broker"
                className="relative w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#003DA5] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Award, value: "15+", label: "Let zkušeností" },
            { icon: HomeIcon, value: "500+", label: "Prodaných nemovitostí" },
            { icon: Users, value: "4", label: "Profesionální makléři" },
            { icon: MapPin, value: "100%", label: "Znalost Tachovska" },
          ].map((s, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <s.icon className="mx-auto mb-3 text-[#DC1C2E]" size={28} />
              <div className="font-display text-3xl md:text-4xl font-black">{s.value}</div>
              <div className="text-sm text-blue-200 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">Aktuální nabídka</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] mt-2">
              Vybrané nemovitosti
            </h2>
          </div>
          <Link to="/nemovitosti" className="inline-flex items-center gap-2 font-bold text-[#003DA5] hover:gap-3 transition-all" data-testid="home-all-properties">
            Zobrazit vše <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[#F9FAFB] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#0A0A0A]">Chcete prodat svou nemovitost?</h2>
            <p className="text-gray-600 mt-2 max-w-xl">Připravíme bezplatné tržní ocenění a postaráme se o celý prodej za vás.</p>
          </div>
          <Link
            to="/kontakt"
            data-testid="home-cta-sell"
            className="whitespace-nowrap bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-4 px-8 uppercase tracking-wider transition-colors"
          >
            Prodat nemovitost
          </Link>
        </div>
      </section>
    </div>
  );
}
