import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "remax_cookie_consent";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 animate-fade-up" data-testid="cookie-consent">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center gap-5 p-5 sm:p-6">
          <div className="flex items-start gap-4 flex-1">
            <span className="hidden sm:flex w-12 h-12 flex-shrink-0 items-center justify-center bg-[#003DA5]/10 text-[#003DA5]">
              <Cookie size={24} />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-[#0A0A0A]">Používáme cookies</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Nezbytné cookies zajišťují správné fungování webu. Analytické cookies pro zlepšování stránek
                používáme pouze s vaším souhlasem. Více v sekci{" "}
                <Link to="/pravni-informace#cookies" className="text-[#003DA5] underline font-semibold">
                  Používání cookies
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
            <button
              onClick={() => decide("necessary")}
              data-testid="cookie-reject"
              className="order-2 sm:order-1 px-5 py-3 text-sm font-bold uppercase tracking-wider border border-gray-300 text-[#0A0A0A] hover:border-[#003DA5] transition-colors"
            >
              Jen nezbytné
            </button>
            <button
              onClick={() => decide("all")}
              data-testid="cookie-accept"
              className="order-1 sm:order-2 px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#003DA5] hover:bg-[#002b75] text-white transition-colors"
            >
              Přijmout vše
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
