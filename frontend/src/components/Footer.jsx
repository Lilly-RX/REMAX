import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="bg-white inline-flex px-3 py-2">
              <Logo />
            </div>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Realitní kancelář s osobním přístupem a hlubokou znalostí Tachovska.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E] mb-4">Navigace</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/nemovitosti" className="hover:text-white transition-colors">Nemovitosti</Link></li>
              <li><Link to="/o-nas" className="hover:text-white transition-colors">O nás</Link></li>
              <li><Link to="/tym" className="hover:text-white transition-colors">Náš tým</Link></li>
              <li><Link to="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E] mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[#003DA5] flex-shrink-0" />
                <span>Náměstí Republiky 751<br />347 01 Tachov</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#003DA5]" />
                <a href="tel:+420371120180" className="hover:text-white">+420 371 120 180</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#003DA5]" />
                <a href="mailto:info@remaxactivebroker.cz" className="hover:text-white">info@remaxactivebroker.cz</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E] mb-4">Otevírací doba</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Clock size={16} className="text-[#003DA5]" /> Po–Pá: 8:30 – 17:00</li>
              <li className="pl-6">So–Ne: zavřeno</li>
            </ul>
          </div>
        </div>

        {/* Legal / company identification */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E] mb-3">Právní a identifikační údaje</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ochranná známka <span className="text-gray-300">RE/MAX Active Broker</span> je provozována podnikatelem
              <span className="text-gray-300"> Slavomír Kortan</span>, IČ <span className="text-gray-300">73451240</span>,
              ID datové schránky <span className="text-gray-300">xsvnzbg</span>, se sídlem náměstí Republiky 751, 347 01 Tachov.
              Makléři jsou nezávislí podnikatelé podnikající na základě živnostenského oprávnění.
              Kancelář je součástí sítě realitních kanceláří RE/MAX v České republice.
              Číslo depozitního účtu kanceláře: <span className="text-gray-300">243212585/0300</span>.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DC1C2E] mb-3">Dokumenty</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/pravni-informace#gdpr" className="hover:text-white transition-colors" data-testid="footer-gdpr">Zpracování osobních údajů (GDPR)</Link></li>
              <li><Link to="/pravni-informace#cookies" className="hover:text-white transition-colors" data-testid="footer-cookies">Používání cookies</Link></li>
              <li><Link to="/pravni-informace#podminky" className="hover:text-white transition-colors" data-testid="footer-terms">Obchodní podmínky a reklamační řád</Link></li>
              <li><Link to="/pravni-informace#oznamovatele" className="hover:text-white transition-colors" data-testid="footer-whistle">Ochrana oznamovatelů</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} RE/MAX Active Broker. Všechna práva vyhrazena.</span>
          <div className="flex items-center gap-4">
            <Link to="/pravni-informace" className="hover:text-gray-300" data-testid="footer-legal-link">Právní informace</Link>
            <Link to="/admin/login" className="hover:text-gray-300" data-testid="footer-admin-link">Administrace</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
