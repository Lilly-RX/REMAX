import { Star } from "lucide-react";

export const StarRating = ({ value = 0, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(value) ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-200"}
      />
    ))}
  </div>
);

export const StarInput = ({ value, onChange, size = 28 }) => (
  <div className="flex items-center gap-1" data-testid="star-input">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        data-testid={`star-${n}`}
        className="transition-transform hover:scale-110"
        aria-label={`${n} hvězdiček`}
      >
        <Star
          size={size}
          className={n <= value ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-300 hover:fill-[#FFE099]"}
        />
      </button>
    ))}
  </div>
);
