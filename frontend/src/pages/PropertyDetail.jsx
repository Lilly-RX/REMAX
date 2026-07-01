import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BedDouble, Bath, Maximize, MapPin, ArrowLeft, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import api, { mediaUrl } from "@/lib/api";
import { formatPrice, PROPERTY_TYPES, DEAL_TYPES, STATUS_LABELS } from "@/lib/format";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`).then((r) => {
      setProperty(r.data);
      setForm((f) => ({ ...f, message: `Dobrý den, mám zájem o nemovitost "${r.data.title}". Prosím o více informací.` }));
      if (r.data.agent_id) {
        api.get("/agents").then((res) => setAgent(res.data.find((a) => a.id === r.data.agent_id)));
      }
    }).catch(() => navigate("/nemovitosti"));
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", { ...form, property_id: id });
      toast.success("Zpráva byla odeslána. Brzy se vám ozveme.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Zprávu se nepodařilo odeslat.");
    } finally {
      setSending(false);
    }
  };

  if (!property) return <div className="max-w-7xl mx-auto px-4 py-28 text-gray-500">Načítání…</div>;

  const images = property.images?.length ? property.images : [];

  return (
    <div data-testid="property-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Link to="/nemovitosti" className="inline-flex items-center gap-2 text-sm font-bold text-[#003DA5] mb-8" data-testid="back-to-listings">
        <ArrowLeft size={16} /> Zpět na nabídku
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Gallery + info */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
            {images[active] ? (
              <img src={mediaUrl(images[active])} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">Bez fotografie</div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-[#003DA5] text-white text-xs font-bold px-3 py-1 uppercase">{DEAL_TYPES[property.deal_type]}</span>
              {property.status !== "aktivni" && (
                <span className="bg-[#DC1C2E] text-white text-xs font-bold px-3 py-1 uppercase">{STATUS_LABELS[property.status]}</span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`w-24 h-20 flex-shrink-0 overflow-hidden border-2 ${active === i ? "border-[#003DA5]" : "border-transparent"}`}>
                  <img src={mediaUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <span className="bg-gray-100 text-[#0A0A0A] text-xs font-bold px-3 py-1 uppercase tracking-wide">
              {PROPERTY_TYPES[property.property_type]}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#0A0A0A] mt-4">{property.title}</h1>
            <p className="flex items-center gap-2 text-gray-500 mt-2"><MapPin size={18} /> {property.location}</p>

            <div className="font-display text-3xl font-black text-[#003DA5] mt-6">
              {property.price_note || formatPrice(property.price, property.currency, property.deal_type)}
            </div>

            <div className="flex flex-wrap gap-6 mt-6 py-6 border-y border-gray-200 text-gray-700">
              {property.bedrooms > 0 && <span className="flex items-center gap-2"><BedDouble size={20} className="text-[#003DA5]" /> {property.bedrooms} pokoje</span>}
              {property.bathrooms > 0 && <span className="flex items-center gap-2"><Bath size={20} className="text-[#003DA5]" /> {property.bathrooms} koupelny</span>}
              {property.area > 0 && <span className="flex items-center gap-2"><Maximize size={20} className="text-[#003DA5]" /> {property.area} m²</span>}
            </div>

            <h2 className="font-display text-xl font-bold text-[#0A0A0A] mt-8 mb-3">Popis</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>
        </div>

        {/* Sidebar contact */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-[#F9FAFB] border border-gray-200 p-6">
            {agent && (
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-200">
                {agent.photo_url && <img src={mediaUrl(agent.photo_url)} alt={agent.name} className="w-16 h-16 object-cover" />}
                <div>
                  <div className="font-display font-bold text-[#0A0A0A]">{agent.name}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#DC1C2E]">{agent.role}</div>
                  {agent.phone && <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-1 text-sm text-gray-600 mt-1"><Phone size={13} /> {agent.phone}</a>}
                </div>
              </div>
            )}
            <h3 className="font-display font-bold text-lg text-[#0A0A0A] mb-4">Mám zájem</h3>
            <form onSubmit={submit} className="space-y-3" data-testid="property-inquiry-form">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jméno a příjmení" data-testid="inquiry-name" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" data-testid="inquiry-email" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" data-testid="inquiry-phone" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5]" />
              <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Zpráva" data-testid="inquiry-message" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#003DA5] resize-none" />
              <button type="submit" disabled={sending} data-testid="inquiry-submit" className="w-full inline-flex items-center justify-center gap-2 bg-[#003DA5] hover:bg-[#002b75] disabled:opacity-60 text-white font-bold py-3 uppercase tracking-wider transition-colors">
                <Send size={16} /> {sending ? "Odesílání…" : "Odeslat poptávku"}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
