const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const formatPrice = (cents: number) => eur.format(cents / 100);
