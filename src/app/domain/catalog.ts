import type { Product } from "../components/PopupStore";
import type { CommercialCategory, IntegrationContext, MessageDTO } from "./types";

const SKINCARE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Age Serum Anti-Aging",
    brand: "Pitch Skincare",
    price: 42.0,
    image: "https://images.unsplash.com/photo-1766940095250-5c7715ab57ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3NzQ2MTIxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Hai menzionato di cercare prodotti anti-aging sostenibili. Questo siero ha ingredienti naturali certificati e ottime recensioni sulla durata.",
  },
  {
    id: "2",
    name: "Brightening Mask",
    brand: "Pitch Skincare",
    price: 28.0,
    image: "https://images.unsplash.com/photo-1764694071508-e4b1efcd39bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBqYXIlMjBtaW5pbWFsfGVufDF8fHx8MTc3NDY0NzU4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Complementa il siero anti-aging che stavi cercando. Ideale per la tua routine settimanale.",
  },
];

const RUNNING_PRODUCTS: Product[] = [
  {
    id: "3",
    name: "CloudRunner Pro",
    brand: "Nova Athletics",
    price: 135.0,
    image: "https://images.unsplash.com/photo-1742132622359-e360924a3567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBhdGhsZXRpYyUyMG1pbmltYWx8ZW58MXx8fHwxNzc0NjQ3ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Hai una gara in arrivo e hai aumentato il chilometraggio. Queste scarpe offrono ottimo ammortizzamento per le lunghe distanze.",
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    id: "4",
    name: "SoundPods Air",
    brand: "AudioTech",
    price: 79.0,
    image: "https://images.unsplash.com/photo-1635862634193-dae77d05fea4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGVhcmJ1ZHMlMjBzcG9ydCUyMGJsYWNrfGVufDF8fHx8MTc3NDY0Nzg1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Ideali per la corsa: resistenti al sudore, leggeri e con buona tenuta.",
  },
];

const BOOKS_PRODUCTS: Product[] = [
  {
    id: "5",
    name: "Atomic Habits",
    brand: "Clear Publishing",
    price: 18.5,
    image: "https://images.unsplash.com/photo-1621944190272-ec775aad58d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwbWluaW1hbCUyMGNvdmVyJTIwcmVhZGluZ3xlbnwxfHx8fDE3NzQ2NDgwOTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Hai mostrato interesse per il miglioramento personale. Questo libro ti aiuterà a costruire abitudini efficaci.",
  },
  {
    id: "6",
    name: "Il Potere delle Abitudini",
    brand: "Mondadori",
    price: 16.0,
    image: "https://images.unsplash.com/photo-1461902492714-c655fb137f7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3ZlbCUyMGJvb2slMjBoYXJkY292ZXJ8ZW58MXx8fHwxNzc0NjQ4MTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Perfetto complemento per approfondire la scienza delle abitudini.",
  },
];

const FITNESS_PRODUCTS: Product[] = [
  {
    id: "7",
    name: "Premium Yoga Mat",
    brand: "ZenFlow",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1767605545968-a102fc151b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWF0JTIwZml0bmVzcyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzQ2NDgxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Hai menzionato di voler iniziare yoga. Questo tappetino offre ottimo grip e ammortizzamento.",
  },
  {
    id: "8",
    name: "Resistance Bands Set",
    brand: "FitPro",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpc3RhbmNlJTIwYmFuZHMlMjBmaXRuZXNzfGVufDF8fHx8MTc3NDYxMzk4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Ideali per il rafforzamento muscolare e la mobilità. Perfetti per allenarti ovunque.",
  },
];

const TECH_PRODUCTS: Product[] = [
  {
    id: "9",
    name: "ProBook Air 14",
    brand: "TechNova",
    price: 899.0,
    image: "https://images.unsplash.com/photo-1641247530898-ed6b1b5215eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMG1pbmltYWwlMjBkZXNrfGVufDF8fHx8MTc3NDY0ODEwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Hai bisogno di un laptop per lavorare in mobilità. Leggero, potente e grande autonomia.",
  },
  {
    id: "10",
    name: "Wireless Headphones Pro",
    brand: "SoundWave",
    price: 199.0,
    image: "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBoZWFkcGhvbmVzJTIwYmxhY2t8ZW58MXx8fHwxNzc0NjQ4MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Cancellazione del rumore attiva per lavoro e musica.",
  },
];

const COOKING_PRODUCTS: Product[] = [
  {
    id: "11",
    name: "Ricette Mediterranee",
    brand: "Giunti Editore",
    price: 22.0,
    image: "https://images.unsplash.com/photo-1665110180279-ee5372bb96bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29rYm9vayUyMGtpdGNoZW4lMjBtaW5pbWFsfGVufDF8fHx8MTc3NDY0ODEwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Ricette mediterranee equilibrate e facili da preparare per una dieta più sana.",
  },
  {
    id: "12",
    name: "Set Coltelli Chef Pro",
    brand: "CucinaPro",
    price: 89.0,
    image: "https://images.unsplash.com/photo-1705917893262-51fec4cd3e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwa25pZmUlMjBzZXQlMjBjaGVmfGVufDF8fHx8MTc3NDY0ODEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Affilati, bilanciati e duraturi — essenziali per cucinare bene.",
  },
];

export interface CatalogScenario {
  trigger: string;
  category: CommercialCategory;
  interestLabel: string;
  buildCommercialMessage: (ctx: IntegrationContext) => Omit<MessageDTO, "id" | "role">;
  buildHelpfulOnlyMessage: (ctx: IntegrationContext) => string;
}

export const CATALOG_SCENARIOS: CatalogScenario[] = [
  {
    trigger: "skincare",
    category: "skincare",
    interestLabel: "Skincare",
    buildCommercialMessage: () => ({
      content: "Stai cercando prodotti anti-aging di qualità e sostenibili. 🌿\n\nHo trovato opzioni con ingredienti naturali certificati e cruelty-free.",
      showStoreButton: true,
      storeProducts: SKINCARE_PRODUCTS,
      storeTitle: "Skincare",
      category: "skincare",
    }),
    buildHelpfulOnlyMessage: () =>
      "Se vuoi, possiamo definire una routine minima (detergente, protezione solare, idratazione) senza acquisti — dimmi cosa usi già oggi.",
  },
  {
    trigger: "corsa",
    category: "running",
    interestLabel: "Running",
    buildCommercialMessage: (ctx) => {
      const race = ctx.calendar.find((e) => e.type === "sport");
      const cal = race ? `Ti stai preparando per <strong>${race.title}</strong> tra ${race.daysUntil} giorni 🏃` : "Vedo che stai lavorando sulla corsa 🏃";
      const runs = ctx.health.recentRuns;
      const health = runs.length > 0 ? `\n\nI dati mostrano una media di ~${ctx.health.avgKmPerWeek} km/settimana, in crescita.` : "";
      const note = ctx.notes.find((n) => n.tag === "shopping" && n.text.toLowerCase().includes("scarpe"));
      const noteHint = note ? `\n\n📝 Nota del ${note.date}: "${note.text}"` : "";
      return {
        content: `${cal}.${health}${noteHint}\n\nLe tue scarpe reggono? Se vuoi, puoi esplorare alcune opzioni.`,
        showStoreButton: true,
        storeProducts: RUNNING_PRODUCTS,
        storeTitle: "Running gear",
        category: "running",
      };
    },
    buildHelpfulOnlyMessage: (ctx) => {
      const race = ctx.calendar.find((e) => e.type === "sport");
      if (race) {
        return `Per la ${race.title}: una progressione graduale e una settimana più leggera prima della gara aiutano più di nuove scarpe. Vuoi un piano?`;
      }
      return "Vuoi che ti aiuti a strutturare la settimana tipo (volume, recupero, ripetute)?";
    },
  },
  {
    trigger: "libr",
    category: "books",
    interestLabel: "Lettura",
    buildCommercialMessage: () => ({
      content: "Ti piace la crescita personale. 📚\n\nHo suggerimenti che potrebbero ispirarti.",
      showStoreButton: true,
      storeProducts: BOOKS_PRODUCTS,
      storeTitle: "Libri consigliati",
      category: "books",
    }),
    buildHelpfulOnlyMessage: () =>
      "Dimmi se preferisci qualcosa di pratico (checklist) o più narrativo: ti propongo 2–3 titoli come lettura, senza acquisti.",
  },
  {
    trigger: "fitness",
    category: "fitness",
    interestLabel: "Fitness",
    buildCommercialMessage: () => ({
      content: "Vuoi integrare nuovi esercizi nella routine! 💪\n\nHo attrezzatura utile per casa o palestra.",
      showStoreButton: true,
      storeProducts: FITNESS_PRODUCTS,
      storeTitle: "Fitness equipment",
      category: "fitness",
    }),
    buildHelpfulOnlyMessage: () =>
      "Possiamo impostare 2–3 sessioni a settimana con corpo libero o poco materiale: dimmi lo spazio che hai.",
  },
  {
    trigger: "tecnologia",
    category: "tech",
    interestLabel: "Tecnologia",
    buildCommercialMessage: () => ({
      content: "Stai cercando tech per produttività e lavoro. 💻\n\nHo selezionato dispositivi che potrebbero aiutarti.",
      showStoreButton: true,
      storeProducts: TECH_PRODUCTS,
      storeTitle: "Tecnologia",
      category: "tech",
    }),
    buildHelpfulOnlyMessage: () =>
      "Chiariamo prima l'uso principale (lavoro, creatività, mobilità) e il budget mentale: così ti oriento senza passare dallo shop.",
  },
  {
    trigger: "cucina",
    category: "cooking",
    interestLabel: "Cucina",
    buildCommercialMessage: (ctx) => {
      const recipe = ctx.notes.find((n) => n.tag === "cucina");
      const hint = recipe ? `\n\n📝 Nota del ${recipe.date}: "${recipe.text}"` : "";
      return {
        content: `Vuoi cucinare di più e in modo più sano. 🍳${hint}\n\nHo prodotti per pasti deliziosi e nutrienti.`,
        showStoreButton: true,
        storeProducts: COOKING_PRODUCTS,
        storeTitle: "Cucina",
        category: "cooking",
      };
    },
    buildHelpfulOnlyMessage: () =>
      "Partiamo da 3 piatti semplici da alternare e una lista base — così cucini meglio anche senza comprare nulla.",
  },
];

export function findScenario(text: string): CatalogScenario | undefined {
  const t = text.toLowerCase();
  return CATALOG_SCENARIOS.find((s) => t.includes(s.trigger));
}

const PRODUCTS_BY_CATEGORY: Record<CommercialCategory, Product[]> = {
  skincare: SKINCARE_PRODUCTS,
  running: RUNNING_PRODUCTS,
  books: BOOKS_PRODUCTS,
  fitness: FITNESS_PRODUCTS,
  tech: TECH_PRODUCTS,
  cooking: COOKING_PRODUCTS,
};

export function getProductsByCategory(category: CommercialCategory): Product[] {
  return PRODUCTS_BY_CATEGORY[category] ?? [];
}

export const DEFAULT_ASSISTANT_REPLY =
  "Ne prendo nota! Posso aiutarti a organizzare la giornata, controllare il calendario, i promemoria o trovare informazioni su qualsiasi tema. Dimmi pure. 😊";
