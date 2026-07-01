import { Link } from "react-router-dom";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { formatPrice, PROPERTY_TYPES, DEAL_TYPES, STATUS_LABELS } from "@/lib/format";

export const PropertyCard = ({ property }) => {
  const img = property.images?.[0];
  return (
    <Link
      to={`/nemovitosti/${property.id}`}
      data-testid={`property-card-${property.id}`}
      className="group bg-white border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {img ? (
          <img
            src={mediaUrl(img)}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">Bez fotografie</div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-[#003DA5] text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
            {DEAL_TYPES[property.deal_type]}
          </span>
          {property.status !== "aktivni" && (
            <span className="bg-[#DC1C2E] text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">
              {STATUS_LABELS[property.status]}
            </span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-[#0A0A0A] text-xs font-bold px-3 py-1 uppercase tracking-wide">
          {PROPERTY_TYPES[property.property_type]}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg text-[#0A0A0A] leading-snug group-hover:text-[#003DA5] transition-colors">
          {property.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin size={14} /> {property.location}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble size={16} /> {property.bedrooms}</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms}</span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1"><Maximize size={16} /> {property.area} m²</span>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-display font-black text-xl text-[#003DA5]">
            {property.price_note || formatPrice(property.price, property.currency, property.deal_type)}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#DC1C2E] group-hover:translate-x-1 transition-transform">
            Detail →
          </span>
        </div>
      </div>
    </Link>
  );
};
