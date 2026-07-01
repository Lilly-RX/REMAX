import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Home as HomeIcon, Award, Users, MapPin } from "lucide-react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { StarRating } from "@/components/StarRating";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/properties", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3)));
    api.get("/reviews").then((r) => setReviews(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85"
            alt="Moderní dům"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/20" />
        </div>

        <img
          src="/team-cutout.png"
          alt="Tým RE/MAX Active Broker"
          className="hidden lg:block absolute bottom-0 right-0 h-[94%] w-auto object-contain object-bottom drop-shadow-2xl z-10 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="max-w-xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-[#DC1C2E]/10 text-[#DC1C2E] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 mb-6">
              <MapPin size={14} /> Realitní kancelář v Tachově
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#0A0A0A] leading-[1.05]">
              Váš domov začíná <span className="text-[#003DA5]">u nás</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
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
                className="inline-flex items-center justify-center gap-2 border-2 border-[#003DA5] text-[#003DA5] hover:bg-[#003DA5] hover:text-white font-bold py-4 px-8 uppercase tracking-wider transition-colors bg-white/70"
              >
                <Search size={18} /> Prohlédnout nabídku
              </Link>
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

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="bg-[#003DA5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff8a93]">Recenze klientů</span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">Co o nás říkají klienti</h2>
              </div>
              <Link to="/recenze" className="inline-flex items-center gap-2 font-bold text-white hover:gap-3 transition-all" data-testid="home-all-reviews">
                Všechny recenze <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white/10 backdrop-blur border border-white/15 p-6" data-testid={`home-review-${r.id}`}>
                  <StarRating value={r.rating} size={16} />
                  <p className="text-blue-50 mt-4 leading-relaxed line-clamp-5">„{r.text}"</p>
                  <div className="mt-5 pt-4 border-t border-white/15 font-bold">{r.author_name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-[#F9FAFB] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#0A0A0A]">Chcete prodat svou nemovitost?</h2>
            <p className="text-gray-600 mt-2 max-w-xl">Připravíme bezplatné tržní ocenění a postaráme se o celý prodej za vás.</p>
          </div>
          <Link
            to="/prodej"
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
