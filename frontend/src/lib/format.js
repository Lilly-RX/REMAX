export const formatPrice = (price, currency = "Kč", dealType) => {
  const formatted = new Intl.NumberFormat("cs-CZ").format(price || 0);
  return dealType === "pronajem" ? `${formatted} ${currency}/měs.` : `${formatted} ${currency}`;
};

export const PROPERTY_TYPES = {
  byt: "Byt",
  dum: "Dům",
  pozemek: "Pozemek",
  komercni: "Komerční",
};

export const DEAL_TYPES = {
  prodej: "Prodej",
  pronajem: "Pronájem",
};

export const STATUS_LABELS = {
  aktivni: "Aktivní",
  rezervovano: "Rezervováno",
  prodano: "Prodáno",
};
