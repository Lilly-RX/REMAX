import { MapPin, HeartHandshake, ShieldCheck, Target } from "lucide-react";
import { PageHero, Reveal } from "@/components/motion";
import { useSeo } from "@/lib/seo";

const ABOUT_IMG = "/tachov.jpg";

export default function About() {
  useSeo({
    title: "O nás – realitní kancelář na Tachovsku",
    description: "Poznejte RE/MAX Active Broker – tým nezávislých realitních makléřů z Tachova s osobním přístupem, znalostí regionu a zázemím značky RE/MAX.",
    path: "/o-nas",
  });
  return (
    <div data-testid="about-page">
      <PageHero
        eyebrow="O nás"
        title="Malý tým s velkým srdcem pro Tachovsko"
        subtitle="Jsme RE/MAX Active Broker – sehraná pětice nezávislých realitních profesionálů pod silnou značkou RE/MAX. Spojuje nás láska k regionu, poctivost a přesvědčení, že za každou nemovitostí stojí konkrétní lidský příběh."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Reveal className="md:col-span-7">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[320px] h-full">
                <img src={ABOUT_IMG} alt="Tachov" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070E]/90 to-transparent" />
                <div className="absolute bottom-0 p-8 text-white">
                  <MapPin className="text-[#DC1C2E] mb-2" />
                  <h3 className="font-display text-2xl font-bold">Doma na Tachovsku</h3>
                  <p className="text-gray-200 mt-1 max-w-md">Známe každou ulici, školu i klidnou čtvrť. Tato znalost je vaší výhodou.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="md:col-span-5">
              <div className="bg-[#F5F6F8] border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col justify-center h-full">
                <Target className="text-[#003DA5] mb-3" size={28} />
                <h3 className="font-display text-2xl font-bold text-[#0A0A0A]">Naše filozofie</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  Pracujeme jako nezávislí makléři, ale táhneme za jeden provaz. Díky tomu
                  spojujeme osobní přístup jednotlivce se silou a zázemím celého týmu.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="md:col-span-5">
              <div className="bg-[#05070E] text-white rounded-3xl shadow-xl p-8 flex flex-col justify-center h-full grain relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#003DA5]/30 rounded-full blur-3xl" />
                <HeartHandshake className="text-[#DC1C2E] mb-3 relative" size={28} />
                <h3 className="font-display text-2xl font-bold relative">Osobní přístup</h3>
                <p className="text-gray-300 mt-2 leading-relaxed relative">
                  Nejste pro nás číslo. Vyslechneme vaše potřeby a provedeme vás celým procesem
                  od prvního setkání až po předání klíčů.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="md:col-span-7">
              <div className="border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col justify-center h-full">
                <ShieldCheck className="text-[#003DA5] mb-3" size={28} />
                <h3 className="font-display text-2xl font-bold text-[#0A0A0A]">Profesionalita a bezpečí</h3>
                <p className="text-gray-600 mt-2 leading-relaxed">
                  Právní servis, ověřené smlouvy, advokátní úschova a transparentní komunikace.
                  Pod značkou RE/MAX máte jistotu, že je o vás profesionálně postaráno.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
