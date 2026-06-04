import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "rw";

type Dict = Record<string, string>;

const en: Dict = {
  "brand": "Elimi Trust Ltd",
  "tagline": "Premium classified marketplace",
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.categories": "Categories",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.login": "Staff Login",
  "nav.dashboard": "Dashboard",
  "nav.logout": "Logout",
  "lang.select": "Choose your language",
  "lang.subtitle": "Select a language to enter the marketplace",
  "lang.continue": "Continue",
  "home.hero.title": "Luxury Marketplace",
  "home.hero.subtitle": "Real estate, vehicles, electronics and more — verified listings, trusted sellers, premium experience.",
  "home.hero.cta": "Browse Products",
  "home.hero.contact": "Contact Us",
  "home.featured": "Featured Listings",
  "home.recent": "Recently Added",
  "home.trending": "Top Liked",
  "home.categories": "Browse Categories",
  "home.empty": "No products yet. Check back soon.",
  "products.title": "All Products",
  "products.search": "Search products…",
  "products.filter.category": "Category",
  "products.filter.all": "All",
  "products.sort.newest": "Newest",
  "products.sort.price_asc": "Price: Low to High",
  "products.sort.price_desc": "Price: High to Low",
  "products.sort.liked": "Most Liked",
  "products.empty": "No products match your search.",
  "product.contact.whatsapp": "Contact via WhatsApp",
  "product.share": "Share",
  "product.like": "Save",
  "product.condition": "Condition",
  "product.brand": "Brand",
  "product.location": "Location",
  "product.posted": "Posted",
  "product.description": "Description",
  "product.related": "Similar Products",
  "product.status.available": "Available",
  "product.status.sold": "Sold",
  "product.status.pending": "Pending",
  "product.status.reserved": "Reserved",
  "about.title": "About Elimi Trust Ltd",
  "about.mission": "Our Mission",
  "about.mission.body": "We connect buyers and sellers across Rwanda with a premium, trusted, multi-category classified marketplace — from real estate to electronics, vehicles to fashion.",
  "about.contact": "Get in touch",
  "contact.title": "Contact Us",
  "contact.subtitle": "We're here to help. Reach us anytime.",
  "contact.phone": "Phone",
  "contact.email": "Email",
  "contact.whatsapp": "WhatsApp",
  "contact.social": "Follow us",
  "auth.title": "Staff Login",
  "auth.subtitle": "Authorized personnel only",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Sign In",
  "auth.signing": "Signing in…",
  "auth.error": "Invalid credentials",
  "footer.rights": "All rights reserved.",
  "footer.tagline": "A trusted multi-category marketplace.",
  "dashboard.welcome": "Welcome back",
  "dashboard.overview": "Overview",
  "dashboard.products": "Products",
  "dashboard.new_product": "New Product",
  "dashboard.reports": "Daily Reports",
  "dashboard.employees": "Employees",
  "dashboard.settings": "Settings",
};

const fr: Dict = {
  "brand": "Elimi Trust Ltd",
  "tagline": "Marketplace classifié premium",
  "nav.home": "Accueil",
  "nav.products": "Produits",
  "nav.categories": "Catégories",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.login": "Connexion Staff",
  "nav.dashboard": "Tableau de bord",
  "nav.logout": "Déconnexion",
  "lang.select": "Choisissez votre langue",
  "lang.subtitle": "Sélectionnez une langue pour entrer dans le marketplace",
  "lang.continue": "Continuer",
  "home.hero.title": "Marketplace de Luxe",
  "home.hero.subtitle": "Immobilier, véhicules, électronique et plus — annonces vérifiées, vendeurs de confiance, expérience premium.",
  "home.hero.cta": "Voir les produits",
  "home.hero.contact": "Nous contacter",
  "home.featured": "Annonces en vedette",
  "home.recent": "Récemment ajoutés",
  "home.trending": "Les plus aimés",
  "home.categories": "Parcourir les catégories",
  "home.empty": "Aucun produit pour le moment.",
  "products.title": "Tous les produits",
  "products.search": "Rechercher…",
  "products.filter.category": "Catégorie",
  "products.filter.all": "Toutes",
  "products.sort.newest": "Plus récents",
  "products.sort.price_asc": "Prix : croissant",
  "products.sort.price_desc": "Prix : décroissant",
  "products.sort.liked": "Plus aimés",
  "products.empty": "Aucun produit ne correspond.",
  "product.contact.whatsapp": "Contacter via WhatsApp",
  "product.share": "Partager",
  "product.like": "Enregistrer",
  "product.condition": "État",
  "product.brand": "Marque",
  "product.location": "Lieu",
  "product.posted": "Publié",
  "product.description": "Description",
  "product.related": "Produits similaires",
  "product.status.available": "Disponible",
  "product.status.sold": "Vendu",
  "product.status.pending": "En attente",
  "product.status.reserved": "Réservé",
  "about.title": "À propos de Elimi Trust Ltd",
  "about.mission": "Notre mission",
  "about.mission.body": "Nous connectons acheteurs et vendeurs au Rwanda via un marketplace premium multi-catégories — immobilier, électronique, véhicules, mode.",
  "about.contact": "Nous contacter",
  "contact.title": "Contact",
  "contact.subtitle": "Nous sommes là pour vous aider.",
  "contact.phone": "Téléphone",
  "contact.email": "Email",
  "contact.whatsapp": "WhatsApp",
  "contact.social": "Suivez-nous",
  "auth.title": "Connexion Staff",
  "auth.subtitle": "Personnel autorisé uniquement",
  "auth.email": "Email",
  "auth.password": "Mot de passe",
  "auth.signin": "Se connecter",
  "auth.signing": "Connexion…",
  "auth.error": "Identifiants invalides",
  "footer.rights": "Tous droits réservés.",
  "footer.tagline": "Un marketplace multi-catégories de confiance.",
  "dashboard.welcome": "Bon retour",
  "dashboard.overview": "Aperçu",
  "dashboard.products": "Produits",
  "dashboard.new_product": "Nouveau produit",
  "dashboard.reports": "Rapports quotidiens",
  "dashboard.employees": "Employés",
  "dashboard.settings": "Paramètres",
};

const rw: Dict = {
  "brand": "Elimi Trust Ltd",
  "tagline": "Isoko ryiza ry'ibicuruzwa",
  "nav.home": "Ahabanza",
  "nav.products": "Ibicuruzwa",
  "nav.categories": "Ibyiciro",
  "nav.about": "Abo turi bo",
  "nav.contact": "Twandikire",
  "nav.login": "Injira (Abakozi)",
  "nav.dashboard": "Imbonerahamwe",
  "nav.logout": "Sohoka",
  "lang.select": "Hitamo ururimi",
  "lang.subtitle": "Hitamo ururimi rwo kwinjira ku isoko",
  "lang.continue": "Komeza",
  "home.hero.title": "Isoko ry'Umutekano",
  "home.hero.subtitle": "Inzu, imodoka, electronics n'ibindi — ibicuruzwa byizewe, abacuruzi b'icyizere.",
  "home.hero.cta": "Reba Ibicuruzwa",
  "home.hero.contact": "Twandikire",
  "home.featured": "Ibyiza cyane",
  "home.recent": "Bishya",
  "home.trending": "Bikunzwe cyane",
  "home.categories": "Reba Ibyiciro",
  "home.empty": "Nta bicuruzwa biraboneka.",
  "products.title": "Ibicuruzwa Byose",
  "products.search": "Shakisha…",
  "products.filter.category": "Icyiciro",
  "products.filter.all": "Byose",
  "products.sort.newest": "Bishya",
  "products.sort.price_asc": "Igiciro: gito → kinini",
  "products.sort.price_desc": "Igiciro: kinini → gito",
  "products.sort.liked": "Bikunzwe",
  "products.empty": "Nta cyabonetse.",
  "product.contact.whatsapp": "Twandikire kuri WhatsApp",
  "product.share": "Sangiza",
  "product.like": "Bika",
  "product.condition": "Imimerere",
  "product.brand": "Ikirango",
  "product.location": "Aho biherereye",
  "product.posted": "Byashyizweho",
  "product.description": "Ibisobanuro",
  "product.related": "Bisa nabyo",
  "product.status.available": "Biraboneka",
  "product.status.sold": "Byaragurishijwe",
  "product.status.pending": "Biracyategerejwe",
  "product.status.reserved": "Byabikwe",
  "about.title": "Abo turi bo — Elimi Trust Ltd",
  "about.mission": "Intego yacu",
  "about.mission.body": "Duhuza abaguzi n'abacuruzi mu Rwanda binyuze ku isoko rinini ry'icyizere — inzu, electronics, imodoka, imyambaro.",
  "about.contact": "Twandikire",
  "contact.title": "Twandikire",
  "contact.subtitle": "Turi hano kugufasha.",
  "contact.phone": "Telefoni",
  "contact.email": "Imeli",
  "contact.whatsapp": "WhatsApp",
  "contact.social": "Dukurikire",
  "auth.title": "Injira (Abakozi)",
  "auth.subtitle": "Abakozi bemerewe gusa",
  "auth.email": "Imeli",
  "auth.password": "Ijambobanga",
  "auth.signin": "Injira",
  "auth.signing": "Birinjira…",
  "auth.error": "Amakuru atari yo",
  "footer.rights": "Uburenganzira bwose burabitswe.",
  "footer.tagline": "Isoko ry'icyizere ry'ibyiciro byinshi.",
  "dashboard.welcome": "Murakaza neza",
  "dashboard.overview": "Incamake",
  "dashboard.products": "Ibicuruzwa",
  "dashboard.new_product": "Igicuruzwa Gishya",
  "dashboard.reports": "Raporo z'umunsi",
  "dashboard.employees": "Abakozi",
  "dashboard.settings": "Igenamiterere",
};

const dicts: Record<Lang, Dict> = { en, fr, rw };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  hasChosen: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("elimi_lang");
    if (saved && (saved === "en" || saved === "fr" || saved === "rw")) {
      setLangState(saved);
      setHasChosen(true);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    if (typeof window !== "undefined") localStorage.setItem("elimi_lang", l);
  };

  const t = (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, hasChosen }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
