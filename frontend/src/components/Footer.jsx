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
                <a href="tel:+420777123456" className="hover:text-white">+420 777 123 456</a>
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
              <li className="flex items-center gap-2"><Clock size={16} className="text-[#003DA5]" /> Po–Pá: 9:00 – 17:00</li>
              <li className="pl-6">So: 9:00 – 12:00</li>
              <li className="pl-6">Ne: zavřeno</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} RE/MAX Active Broker. Všechna práva vyhrazena.</span>
          <Link to="/admin/login" className="hover:text-gray-300" data-testid="footer-admin-link">Administrace</Link>
        </div>
      </div>
    </footer>
  );
};
