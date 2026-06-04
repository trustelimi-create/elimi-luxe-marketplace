// Single source of truth for Elimi Trust contact info.
export const BRAND = {
  name: "Elimi Trust Ltd",
  email: "elimitrustltd1996@gmail.com",
  phones: ["0740799299", "0786520082"] as const,
  whatsapp: ["250740799299", "250786520082"] as const, // international format
  instagram: "elimitrusteltd",
  tiktok: "elimi trust",
  facebook: "elimi trust",
  instagramUrl: "https://instagram.com/elimitrusteltd",
  tiktokUrl: "https://www.tiktok.com/@elimitrust",
  facebookUrl: "https://facebook.com/elimitrust",
};

export function buildWhatsAppLink(
  productTitle: string,
  productId: string,
  productUrl: string,
  lang: "en" | "fr" | "rw" = "en",
): string {
  const phone = BRAND.whatsapp[0];
  const greeting =
    lang === "fr"
      ? `Bonjour, je suis intéressé par ce produit : ${productTitle} (ID: ${productId}) — ${productUrl}`
      : lang === "rw"
      ? `Muraho, ndashaka iki gicuruzwa: ${productTitle} (ID: ${productId}) — ${productUrl}`
      : `Hello, I am interested in this product: ${productTitle} (ID: ${productId}) — ${productUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
}
