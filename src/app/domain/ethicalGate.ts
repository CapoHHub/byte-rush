import type { CommercialCategory, EthicalDecision, PurchaseRecord } from "./types";

const NIGHT_START_HOUR = 23;
const NIGHT_END_HOUR = 6;
const MIN_USER_TURNS_BEFORE_COMMERCE = 3;
const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

const EMOTION_HINTS = [
  "stress",
  "ansia",
  "ansioso",
  "ansiosa",
  "triste",
  "depress",
  "non ce la faccio",
  "sotto pressione",
  "panico",
  "mal di testa",
  "non dormo",
  "piango",
  "esausto",
  "stressato",
  "stressata",
  "preoccupat",
  "spavent",
];

export function detectEmotionalDistress(text: string): boolean {
  const t = text.toLowerCase();
  return EMOTION_HINTS.some((w) => t.includes(w));
}

export function isNightWindow(now: Date): boolean {
  const h = now.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

export function countPurchasesLastDays(purchases: PurchaseRecord[], now: Date, days: number): number {
  const since = now.getTime() - days * 24 * 60 * 60 * 1000;
  return purchases.filter((p) => p.at >= since).length;
}

export function hasRecentPurchaseInCategory(
  purchases: PurchaseRecord[],
  category: CommercialCategory,
  now: Date
): boolean {
  const since = now.getTime() - MS_30_DAYS;
  return purchases.some((p) => p.category === category && p.at >= since);
}

export function evaluateEthicalGate(input: {
  userText: string;
  now: Date;
  userTurnCount: number;
  commercialAlreadyShownThisSession: boolean;
  category: CommercialCategory;
  purchases: PurchaseRecord[];
  monthlyBudgetEUR: number | null;
  spendThisMonthEUR: number;
  prospectivePriceEUR?: number;
  nightProtectionEnabled?: boolean;
}): EthicalDecision {
  if (detectEmotionalDistress(input.userText)) {
    return {
      allow: false,
      code: "EMOTION",
      userFacingHint:
        "Preferisco non proporti acquisti in questo momento. Sono qui per ascoltarti: vuoi parlarne un po'?",
    };
  }

  if (input.nightProtectionEnabled !== false && isNightWindow(input.now)) {
    return {
      allow: false,
      code: "NIGHT",
      userFacingHint:
        "Di notte evito i suggerimenti di shopping — è un momento per rallentare. Possiamo riprendere domani con idee chiare.",
    };
  }

  if (input.userTurnCount < MIN_USER_TURNS_BEFORE_COMMERCE) {
    return {
      allow: false,
      code: "EARLY_SESSION",
      userFacingHint:
        "Prima di proporti qualcosa da acquistare preferisco conoscerti meglio in chat. Continuiamo a parlare?",
    };
  }

  if (input.commercialAlreadyShownThisSession) {
    return {
      allow: false,
      code: "SESSION_CAP",
      userFacingHint:
        "In questa sessione ho già mostrato un suggerimento commerciale — così evitiamo pressioni. Per il resto sono tutto orecchi.",
    };
  }

  if (hasRecentPurchaseInCategory(input.purchases, input.category, input.now)) {
    return {
      allow: false,
      code: "RECENT_SIMILAR",
      userFacingHint:
        "Hai già acquistato qualcosa di simile di recente: non ti propongo altro nello stesso ambito per un po'. Se serve altro, chiedi pure.",
    };
  }

  if (
    input.monthlyBudgetEUR != null &&
    input.prospectivePriceEUR != null &&
    input.spendThisMonthEUR + input.prospectivePriceEUR > input.monthlyBudgetEUR
  ) {
    return {
      allow: false,
      code: "BUDGET",
      userFacingHint: `Hai impostato un budget mensile di €${input.monthlyBudgetEUR.toFixed(0)} e saresti sopra soglia. Possiamo parlarne senza acquisti finché non lo aggiorni dalla Carta d'identità.`,
    };
  }

  return { allow: true };
}
