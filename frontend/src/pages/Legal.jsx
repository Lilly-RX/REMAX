import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Building2, Shield, Cookie, FileText, Megaphone } from "lucide-react";

const Section = ({ icon: Icon, title, children, id }) => (
  <section id={id} className="scroll-mt-28" data-testid={`legal-${id}`}>
    <div className="flex items-center gap-3 mb-4">
      <span className="w-10 h-10 flex items-center justify-center bg-[#003DA5]/10 text-[#003DA5] rounded-xl">
        <Icon size={20} />
      </span>
      <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">{title}</h2>
    </div>
    <div className="text-gray-600 leading-relaxed space-y-3 text-sm sm:text-base">{children}</div>
  </section>
);

export default function Legal() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div data-testid="legal-page">
      <section className="relative overflow-hidden bg-[#05070E] text-white grain">
        <div className="absolute -top-24 -right-20 w-96 h-96 bg-[#003DA5]/25 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E]">Právní informace</span>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mt-3">Právní informace a ochrana údajů</h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <Section icon={Building2} title="Identifikační údaje" id="identifikace">
          <p>
            Ochranná známka <strong>RE/MAX Active Broker</strong> je provozována podnikatelem{" "}
            <strong>Slavomír Kortan</strong>.
          </p>
          <ul className="list-none space-y-1.5">
            <li><strong>IČ:</strong> 73451240</li>
            <li><strong>Sídlo:</strong> náměstí Republiky 751, 347 01 Tachov</li>
            <li><strong>ID datové schránky:</strong> xsvnzbg</li>
            <li><strong>Telefon:</strong> +420 371 120 180</li>
            <li><strong>E-mail:</strong> activebroker@re-max.cz</li>
            <li><strong>Číslo depozitního účtu kanceláře:</strong> 243212585/0300</li>
          </ul>
          <p>
            Jednotliví makléři jsou nezávislí podnikatelé podnikající na základě živnostenského oprávnění.
            Kancelář je součástí sítě realitních kanceláří RE/MAX v České republice.
          </p>
          <p>
            Obchodní značka RE/MAX Česká republika je provozována společností Kreuziger&amp;Sobotik, s.r.o.,
            IČ 27177149, se sídlem Hvězdova 1689/2a, 140 00 Praha 4, zapsanou v obchodním rejstříku vedeném
            Městským soudem v Praze, oddíl C, vložka 102169.
          </p>
        </Section>

        <Section icon={Shield} title="Zpracování osobních údajů (GDPR)" id="gdpr">
          <p>
            Vaše osobní údaje, které nám poskytnete prostřednictvím formulářů na těchto stránkách (jméno,
            e-mail, telefon a obsah zprávy), zpracováváme za účelem vyřízení vašeho dotazu či poptávky a
            následné realitní spolupráce, a to v souladu s Nařízením EU č. 2016/679 (GDPR).
          </p>
          <p>
            Údaje jsou zpracovávány po dobu nezbytnou k vyřízení požadavku a poté po dobu vyžadovanou právními
            předpisy. Údaje nepředáváme třetím stranám s výjimkou případů stanovených zákonem.
          </p>
          <p>
            Máte právo na přístup ke svým údajům, jejich opravu či výmaz, omezení zpracování, přenositelnost a
            právo vznést námitku proti zpracování. Se stížností se můžete obrátit na Úřad pro ochranu osobních
            údajů (<a href="https://uoou.gov.cz" target="_blank" rel="noreferrer" className="text-[#003DA5] underline">uoou.gov.cz</a>).
          </p>
          <p>
            Kompletní informace o zpracování osobních údajů v síti RE/MAX naleznete v dokumentu{" "}
            <a href="https://www.remax-czech.cz/pravni-ustanoveni" target="_blank" rel="noreferrer" className="text-[#003DA5] underline font-semibold">
              Právní ustanovení RE/MAX ČR
            </a>.
          </p>
        </Section>

        <Section icon={Cookie} title="Používání cookies" id="cookies">
          <p>
            Tyto webové stránky používají nezbytné technické soubory cookies, které zajišťují jejich správné
            fungování (např. přihlášení do administrace). Analytické či marketingové cookies používáme pouze
            s vaším souhlasem.
          </p>
          <p>
            Ukládání souborů cookies můžete kdykoli spravovat nebo zakázat v nastavení svého webového prohlížeče.
          </p>
        </Section>

        <Section icon={FileText} title="Obchodní podmínky a reklamační řád" id="podminky">
          <p>
            Realitní služby jsou poskytovány v souladu s obchodními podmínkami a reklamačním řádem sítě RE/MAX
            Česká republika. Případnou reklamaci lze uplatnit dle reklamačního řádu vydaného společností
            RE/MAX Česká republika.
          </p>
          <p>
            Úplné znění obchodních podmínek a reklamačního řádu je k dispozici na oficiálních stránkách{" "}
            <a href="https://www.remax-czech.cz/pravni-ustanoveni" target="_blank" rel="noreferrer" className="text-[#003DA5] underline font-semibold">
              RE/MAX ČR – Právní ustanovení
            </a>.
          </p>
        </Section>

        <Section icon={Megaphone} title="Ochrana oznamovatelů" id="oznamovatele">
          <p>
            V souladu se zákonem č. 171/2023 Sb., o ochraně oznamovatelů, je zřízen vnitřní oznamovací systém
            pro oznamování možného protiprávního jednání. Oznámení lze podat prostřednictvím kontaktních údajů
            kanceláře uvedených výše, případně prostřednictvím externího oznamovacího systému Ministerstva
            spravedlnosti ČR.
          </p>
        </Section>
      </div>
    </div>
  );
}
