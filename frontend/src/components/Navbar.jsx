import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Domů" },
  { to: "/nemovitosti", label: "Nemovitosti" },
  { to: "/o-nas", label: "O nás" },
  { to: "/tym", label: "Náš tým" },
  { to: "/recenze", label: "Recenze" },
  { to: "/kontakt", label: "Kontakt" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm" : "bg-white border-b border-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" data-testid="nav-logo-link">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-testid={`nav-link-${item.label}`}
                  className={`text-sm font-bold uppercase tracking-wider transition-colors relative py-2 ${
                    active ? "text-[#003DA5]" : "text-[#0A0A0A] hover:text-[#003DA5]"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#DC1C2E]" />}
                </Link>
              );
            })}
            <Link
              to="/prodej"
              data-testid="nav-cta-sell"
              className="bg-[#DC1C2E] hover:bg-[#a31522] text-white font-bold py-2.5 px-5 text-sm uppercase tracking-wider rounded-full shadow-md shadow-red-900/20 hover:scale-[1.04] transition-transform"
            >
              Prodat nemovitost
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-[#0A0A0A]"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-1" data-testid="nav-mobile-menu">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-testid={`nav-mobile-link-${item.label}`}
              className="block py-3 text-base font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-gray-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/prodej"
            className="block mt-3 text-center bg-[#DC1C2E] text-white font-bold py-3 uppercase tracking-wider rounded-full"
          >
            Prodat nemovitost
          </Link>
        </div>
      )}
    </header>
  );
};
