import { MapPin, HeartHandshake, ShieldCheck, Target } from "lucide-react";

const ABOUT_IMG = "https://images.pexels.com/photos/20670902/pexels-photo-20670902.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">O nás</span>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-[#0A0A0A] mt-3 leading-tight">
            Malý tým s velkým srdcem pro Tachovsko
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Jsme RE/MAX Active Broker – sehraná čtveřice nezávislých realitních profesionálů,
            kteří působí pod silnou značkou RE/MAX. Spojuje nás láska k regionu, poctivost
            a přesvědčení, že za každou nemovitostí stojí konkrétní lidský příběh.
          </p>
        </div>

        {/* Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-14">
          <div className="md:col-span-7 relative overflow-hidden min-h-[320px]">
            <img src={ABOUT_IMG} alt="Tachov" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003DA5]/90 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <MapPin className="text-[#DC1C2E] mb-2" />
              <h3 className="font-display text-2xl font-bold">Doma na Tachovsku</h3>
              <p className="text-blue-100 mt-1 max-w-md">Známe každou ulici, školu i klidnou čtvrť. Tato znalost je vaší výhodou.</p>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#F9FAFB] border border-gray-200 p-8 flex flex-col justify-center">
            <Target className="text-[#003DA5] mb-3" size={28} />
            <h3 className="font-display text-2xl font-bold text-[#0A0A0A]">Naše filozofie</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">
              Pracujeme jako nezávislí makléři, ale táhneme za jeden provaz. Díky tomu
              spojujeme osobní přístup jednotlivce se silou a zázemím celého týmu.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#003DA5] text-white p-8 flex flex-col justify-center">
            <HeartHandshake className="text-[#DC1C2E] mb-3" size={28} />
            <h3 className="font-display text-2xl font-bold">Osobní přístup</h3>
            <p className="text-blue-100 mt-2 leading-relaxed">
              Nejste pro nás číslo. Vyslechneme vaše potřeby a provedeme vás celým procesem
              od prvního setkání až po předání klíčů.
            </p>
          </div>

          <div className="md:col-span-7 border border-gray-200 p-8 flex flex-col justify-center">
            <ShieldCheck className="text-[#003DA5] mb-3" size={28} />
            <h3 className="font-display text-2xl font-bold text-[#0A0A0A]">Profesionalita a bezpečí</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">
              Právní servis, ověřené smlouvy, advokátní úschova a transparentní komunikace.
              Pod značkou RE/MAX máte jistotu, že je o vás profesionálně postaráno.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
