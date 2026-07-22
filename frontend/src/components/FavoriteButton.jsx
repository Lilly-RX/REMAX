import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/context/FavoritesContext";

export const FavoriteButton = ({ propertyId, size = 18, className = "" }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(propertyId);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(propertyId);
    if (fav) {
      toast("Odebráno z oblíbených");
    } else {
      toast.success("Přidáno do oblíbených");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`favorite-btn-${propertyId}`}
      aria-label={fav ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      className={`flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart size={size} className={fav ? "fill-[#DC1C2E] text-[#DC1C2E]" : "text-[#0A0A0A]"} />
    </button>
  );
};
