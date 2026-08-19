import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Home as HomeIcon,
  Award,
  Users,
  MapPin,
  Star,
  Facebook,
  Instagram,
  Phone,
  Ruler,
  Handshake,
  KeyRound,
  MessageCircle,
} from "lucide-react";
import api from "@/lib/api";
import { PropertyCard } from "@/components/PropertyCard";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/format";
import { useSeo } from "@/lib/seo";

const EASE = [0.22, 1, 0.36, 1];

/* Masked line-by-line reveal for hero headline */
const MaskLine = ({ children, delay = 0 }) => (
  <span className="block overflow-hidden pb-[0.12em]">
    <motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  </span>
);

/* Scroll-reveal wrapper */
const Reveal = ({ children, delay = 0, y = 40, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

/* Animated counter for stats — resilient: always ends on the real value */
const StatCounter = ({ value, suffix = "", prefix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  // Safety net: never leave a stat stuck at 0 (e.g. if IntersectionObserver
  // never fires on some mobile browsers).
  useEffect(() => {
    const t = setTimeout(() => {
      setDisplay((d) => (d === 0 && value !== 0 ? value : d));
    }, 2600);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

const SERVICES = [
  {
    key: "odhad",
    n: "01",
    title: "Chci odhad",
    desc: "Zdarma vám určíme reálnou tržní cenu vaší nemovitosti.",
    to: "/prodej?typ=odhad",
    img: "/karolina.webp",
    icon: Ruler,
  },
  {
    key: "prodej",
    n: "02",
    title: "Chci prodat",
    desc: "Zajistíme celý prodej a vyjednáme pro vás lepší cenu.",
    to: "/prodej?typ=prodej",
    img: "https://images.pexels.com/photos/32666364/pexels-photo-32666364.jpeg?auto=compress&cs=tinysrgb&w=900",
    icon: Handshake,
  },
  {
    key: "pronajem",
    n: "03",
    title: "Chci pronajmout",
    desc: "Najdeme prověřeného nájemníka a ohlídáme smlouvy.",
    to: "/prodej",
    img: "https://images.unsplash.com/photo-1704040686428-7534b262d0d8?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    icon: KeyRound,
  },
  {
    key: "konzultace",
    n: "04",
    title: "Chci konzultaci",
    desc: "Praktické rady k prodeji, koupi i investování do realit.",
    to: "/kontakt",
    img: "https://images.unsplash.com/photo-1638262052640-82e94d64664a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    icon: MessageCircle,
  },
];

const CHAPTERS = [
  {
    n: "01",
    title: "Znalost regionu",
    body: "Tachovsko známe do posledního koutu. Víme, kde se dobře žije, jak se hýbou ceny a kdo právě hledá.",
  },
  {
    n: "02",
    title: "Osobní přístup",
    body: "Nejste číslo v tabulce. Provedeme vás celým obchodem od prvního setkání až po předání klíčů.",
  },
  {
    n: "03",
    title: "Výsledky, ne sliby",
    body: "Stovky spokojených klientů a 17 let praxe. Prodáváme rychle, bezpečně a za nejlepší možnou cenu.",
  },
];

export default function Home() {
  useSeo({
    title: "Reality Tachov – prodej, koupě a pronájem nemovitostí",
    description: "RE/MAX Active Broker – realitní kancelář v Tachově. Sehraný tým 5 makléřů vám pomůže s prodejem, koupí i pronájmem nemovitostí na Tachovsku i v zahraničí.",
    path: "/",
  });
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState({ deal: "", type: "", location: "", priceMax: "" });

  const runSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.deal) params.set("deal", q.deal);
    if (q.type) params.set("type", q.type);
    if (q.location.trim()) params.set("location", q.location.trim());
    if (q.priceMax) params.set("pmax", q.priceMax);
    navigate(`/nemovitosti${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const teamY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
    api.get("/properties", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3)));
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
  }, []);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 4.9;
  const topReviews = reviews.slice(0, 4);

  return (
    <div data-testid="home-page" className="bg-white">
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#05070E] grain">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920"
            alt="Moderní dům"
            className="w-full h-[120%] object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-transparent to-transparent" />
        </motion.div>

        {/* Team cutout with parallax */}
        <motion.img
          src="/team-cutout.png"
          alt="Tým RE/MAX Active Broker"
          style={{ y: teamY }}
          className="hidden lg:block absolute bottom-0 right-0 h-[92%] w-auto object-contain object-bottom z-10 drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />

        {/* Floating rating badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.7, ease: EASE }}
          className="hidden sm:flex absolute bottom-28 lg:bottom-32 right-6 lg:right-[42%] z-30 items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl pl-3 pr-5 py-3 shadow-2xl shadow-black/40"
          data-testid="hero-rating-badge"
        >
          <span className="w-11 h-11 rounded-xl bg-[#DC1C2E] text-white flex items-center justify-center">
            <Star size={20} className="fill-white" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-black text-[#0A0A0A]">{avg.toFixed(1)} / 5</div>
            <div className="text-xs text-gray-500 font-semibold">na základě recenzí klientů</div>
          </div>
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="inline-flex items-center gap-2 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-8 backdrop-blur"
            >
              <MapPin size={14} className="text-[#DC1C2E]" /> Realitní kancelář · Tachov
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-[-0.03em] text-white leading-[0.95]">
              <MaskLine delay={0.15}>Váš domov</MaskLine>
              <MaskLine delay={0.28}>
                začíná <span className="text-[#DC1C2E]">u nás</span>
              </MaskLine>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.9 }}
              className="mt-8 text-lg text-gray-300 leading-relaxed max-w-lg"
            >
              Sehraný tým šesti zkušených makléřů s osobním přístupem a hlubokou
              znalostí tachovského regionu. Prodáme vaši nemovitost rychle a bezpečně.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/prodej"
                data-testid="hero-cta-contact"
                className="group inline-flex items-center justify-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-red-900/30 hover:scale-[1.03] transition-transform"
              >
                Chci ocenit nemovitost
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/nemovitosti"
                data-testid="hero-cta-listings"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white hover:text-[#05070E] font-bold py-4 px-8 rounded-full transition-colors backdrop-blur"
              >
                <Search size={18} /> Prohlédnout nabídku
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============ QUICK SEARCH ============ */}
      <div className="relative z-30 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            onSubmit={runSearch}
            data-testid="home-quick-search"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="-mt-12 md:-mt-16 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-100 p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Nabídka</label>
              <select
                value={q.deal}
                onChange={(e) => setQ({ ...q, deal: e.target.value })}
                data-testid="quick-deal"
                className="mt-1 w-full bg-[#F5F6F8] border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition"
              >
                <option value="">Vše</option>
                {Object.entries(DEAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Typ nemovitosti</label>
              <select
                value={q.type}
                onChange={(e) => setQ({ ...q, type: e.target.value })}
                data-testid="quick-type"
                className="mt-1 w-full bg-[#F5F6F8] border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition"
              >
                <option value="">Všechny typy</option>
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Lokalita</label>
              <input
                value={q.location}
                onChange={(e) => setQ({ ...q, location: e.target.value })}
                placeholder="např. Tachov"
                data-testid="quick-location"
                className="mt-1 w-full bg-[#F5F6F8] border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003DA5]/30 focus:border-[#003DA5] transition"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                data-testid="quick-search-btn"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-900/20 hover:scale-[1.02] transition-transform"
              >
                <Search size={18} /> Hledat nemovitosti
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* ============ MARQUEE ============ */}
      <div className="bg-[#003DA5] text-white py-5 overflow-hidden marquee-mask">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
              {["Prodej", "Koupě", "Pronájem", "Odhad zdarma", "Tachovsko", "17 let praxe", "Osobní přístup"].map((w, i) => (
                <span key={i} className="flex items-center font-display font-black text-2xl sm:text-3xl uppercase tracking-tight px-8">
                  {w}
                  <Star size={16} className="ml-8 fill-[#DC1C2E] text-[#DC1C2E]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ STATS ============ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">Čísla, která mluví za nás</span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.02em] text-[#0A0A0A] mt-4 leading-[1.05]">
              Nepočítáme jen metry čtvereční. Počítáme důvěru.
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { icon: Award, value: 17, suffix: "+", label: "Let zkušeností", sub: "Praxe znát na výsledcích" },
              { icon: HomeIcon, value: 500, suffix: "+", label: "Prodaných nemovitostí", sub: "Stovky spokojených klientů" },
              { icon: Users, value: 6, suffix: "", label: "Profesionální makléři", sub: "Sehraný tým na jednom místě" },
              { icon: MapPin, value: 100, suffix: "%", label: "Znalost Tachovska", sub: "Region známe do detailu" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08} className="border-t-2 border-[#0A0A0A] pt-5">
                <s.icon className="text-[#003DA5] mb-4" size={26} />
                <div className="font-display text-5xl sm:text-6xl font-black text-[#0A0A0A] tracking-tighter">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm font-bold text-[#0A0A0A] mt-3">{s.label}</div>
                <div className="text-sm text-gray-500 mt-1 leading-snug">{s.sub}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="bg-[#F5F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">S čím vám pomůžeme</span>
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.02em] text-[#0A0A0A] mt-4 leading-[1.05]">
                Vyberte si, co potřebujete
              </h2>
            </div>
            <Link to="/prodej" className="group inline-flex items-center gap-2 font-bold text-[#003DA5]" data-testid="services-cta">
              Nezávazně nás oslovit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => (
              <Reveal key={s.key} delay={i * 0.08}>
                <Link
                  to={s.to}
                  data-testid={`service-${s.key}`}
                  className="group relative block h-[380px] rounded-3xl overflow-hidden bg-[#0A0A0A]"
                >
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <span className="absolute top-5 left-5 font-display text-sm font-black text-white/60">{s.n}</span>
                  <span className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white group-hover:bg-[#DC1C2E] transition-colors">
                    <ArrowUpRight size={18} />
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <s.icon size={22} className="text-[#DC1C2E] mb-3" />
                    <h3 className="font-display text-2xl font-black text-white">{s.title}</h3>
                    <p className="text-sm text-gray-300 mt-2 leading-snug opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-500">
                      {s.desc}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section className="bg-[#05070E] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">Proč právě my</span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.02em] mt-4 leading-[1.02]">
              Nejsme tu proto,
              <br /> abychom to zkusili.
            </h2>
            <p className="text-gray-400 mt-6 max-w-md leading-relaxed">
              Jsme tu, abychom váš obchod dotáhli do konce — s klidem, přehledem a nejlepším možným výsledkem.
            </p>

            <div className="mt-12 space-y-0">
              {CHAPTERS.map((c, i) => (
                <Reveal key={c.n} delay={i * 0.1}>
                  <div className="flex gap-6 py-6 border-t border-white/10">
                    <span className="font-display text-lg font-black text-[#DC1C2E] pt-1">{c.n}</span>
                    <div>
                      <h3 className="font-display text-xl font-bold">{c.title}</h3>
                      <p className="text-gray-400 mt-1.5 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Link
              to="/o-nas"
              data-testid="manifesto-cta"
              className="group inline-flex items-center gap-2 mt-8 font-bold text-white"
            >
              Přečtěte si náš příběh
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#003DA5]/20 rounded-[2.5rem] blur-2xl" />
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
                <img
                  src="/team-hero.png"
                  alt="Tým RE/MAX Active Broker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white text-[#0A0A0A] rounded-2xl px-6 py-4 shadow-2xl">
                <div className="font-display text-3xl font-black">6</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">makléřů · 1 tým</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURED ============ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">Aktuální nabídka</span>
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.02em] text-[#0A0A0A] mt-4">
                Vybrané nemovitosti
              </h2>
            </div>
            <Link to="/nemovitosti" className="group inline-flex items-center gap-2 font-bold text-[#003DA5]" data-testid="home-all-properties">
              Zobrazit vše
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ REVIEWS ============ */}
      {topReviews.length > 0 && (
        <section className="bg-[#003DA5] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff8a93]">Co říkají klienti</span>
                <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[-0.02em] mt-4">
                  Za důvěrou stojí práce
                </h2>
              </div>
              <div className="flex items-center gap-3" data-testid="home-reviews-avg">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={20} className={n <= Math.round(avg) ? "fill-[#FFB800] text-[#FFB800]" : "fill-white/20 text-white/20"} />
                  ))}
                </div>
                <span className="font-display text-2xl font-black">{avg.toFixed(1)}</span>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topReviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.06}>
                  <div className="bg-white/[0.07] backdrop-blur border border-white/10 rounded-2xl p-7 h-full" data-testid={`home-review-${r.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={15} className={n <= r.rating ? "fill-[#FFB800] text-[#FFB800]" : "fill-white/20 text-white/20"} />
                        ))}
                      </div>
                      {r.created_at && (
                        <span className="text-xs text-blue-200">{new Date(r.created_at).toLocaleDateString("cs-CZ")}</span>
                      )}
                    </div>
                    <p className="text-blue-50 mt-4 leading-relaxed line-clamp-4">„{r.text}"</p>
                    <div className="mt-5 pt-4 border-t border-white/10 font-bold">{r.author_name}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12">
              <Link to="/recenze" className="group inline-flex items-center gap-2 font-bold text-white" data-testid="home-all-reviews">
                Zobrazit všechny recenze
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ SOCIAL + CTA ============ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#05070E] text-white grain p-8 sm:p-14">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#003DA5]/30 rounded-full blur-3xl" />
              <div className="absolute -left-16 bottom-0 w-72 h-72 bg-[#DC1C2E]/20 rounded-full blur-3xl" />
              <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">Sledujte nás</span>
                  <h2 className="font-display text-3xl sm:text-5xl font-black tracking-[-0.02em] mt-4 leading-[1.05]">
                    Vaši nemovitost prodáme rychleji.
                  </h2>
                  <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                    Díky sociálním sítím oslovíme mnohem více zájemců. Sledujte naši nabídku a nezmeškejte novou příležitost.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://www.facebook.com/RemaxActiveBroker"
                      target="_blank"
                      rel="noreferrer"
                      data-testid="home-facebook-link"
                      className="group inline-flex items-center justify-center gap-3 bg-white text-[#05070E] font-bold py-3.5 px-6 rounded-full hover:scale-[1.03] transition-transform"
                    >
                      <Facebook size={20} className="text-[#003DA5]" />
                      Facebook
                      <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <a
                      href="https://www.instagram.com/remaxactivebroker"
                      target="_blank"
                      rel="noreferrer"
                      data-testid="home-instagram-link"
                      className="group inline-flex items-center justify-center gap-3 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold py-3.5 px-6 rounded-full hover:scale-[1.03] transition-transform"
                    >
                      <Instagram size={20} />
                      Instagram
                      <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                <div className="lg:pl-10 lg:border-l border-white/10">
                  <h3 className="font-display text-2xl font-black">Chcete prodat nemovitost?</h3>
                  <p className="text-gray-400 mt-3 leading-relaxed">
                    Připravíme bezplatné tržní ocenění a postaráme se o celý prodej za vás — rychle, bezpečně a s osobním přístupem.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/prodej"
                      data-testid="home-cta-sell"
                      className="inline-flex items-center justify-center gap-2 bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-red-900/30 hover:scale-[1.03] transition-transform"
                    >
                      Prodat nemovitost <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/kontakt"
                      data-testid="home-cta-contact-2"
                      className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white hover:text-[#05070E] font-bold py-4 px-8 rounded-full transition-colors"
                    >
                      Kontaktovat
                    </Link>
                  </div>

                  <div className="mt-8 flex items-center gap-4 bg-white/[0.06] border border-white/10 rounded-2xl p-4" data-testid="home-estimate-assistant">
                    <img
                      src="/karolina.webp"
                      alt="Karolína Kratochvílová"
                      className="w-16 h-16 rounded-full object-cover object-top shrink-0"
                    />
                    <div className="leading-tight">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">Váš odhad má na starosti</div>
                      <div className="font-display text-lg font-bold mt-1">Karolína Kratochvílová</div>
                      <div className="text-sm text-gray-400">Asistentka kanceláře</div>
                      <a href="tel:+420777565992" className="inline-flex items-center gap-2 text-sm text-white font-semibold mt-1.5 hover:text-[#DC1C2E] transition-colors">
                        <Phone size={14} className="text-[#DC1C2E]" /> +420 777 565 992
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
