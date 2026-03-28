import { evaluateEthicalGate } from "./ethicalGate";
import { sendToGemini, isGeminiAvailable, resetGeminiChat } from "./geminiService";
import type { Product } from "../components/PopupStore";
import type { MessageDTO, PurchaseRecord, SuggestionEvent, ConnectedIntegrations, IntegrationSource, CommercialCategory } from "./types";

export interface EngineInput {
  userText: string;
  userTurnCount: number;
  now: Date;
  purchases: PurchaseRecord[];
  monthlyBudgetEUR: number | null;
  spendThisMonthEUR: number;
  connectedIntegrations: ConnectedIntegrations;
  nightProtectionEnabled: boolean;
  getProductsByCategory: (cat: CommercialCategory) => Product[];
}

export interface EngineResult {
  messages: MessageDTO[];
  events: SuggestionEvent[];
  commercialOffered: boolean;
  inferredInterest?: { label: string; snippet: string };
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export { resetGeminiChat };

export async function runAssistantTurn(input: EngineInput): Promise<EngineResult> {
  if (!isGeminiAvailable()) {
    return fallbackResponse();
  }

  try {
    const gemini = await sendToGemini(input.userText, input.connectedIntegrations);

    const events: SuggestionEvent[] = [];
    let commercialOffered = false;

    const mainMessage: MessageDTO = {
      id: newId(),
      role: "assistant",
      content: gemini.text,
      sources: gemini.sources.length > 0 ? gemini.sources : undefined,
    };

    if (gemini.needsIntegration && !input.connectedIntegrations[gemini.needsIntegration]) {
      mainMessage.integrationConsentRequest = gemini.needsIntegration;
    }

    const messages: MessageDTO[] = [mainMessage];

    if (gemini.commercialCategory) {
      const commercialResult = handleCommercialFromGemini(
        gemini.commercialCategory,
        input,
      );

      if (commercialResult) {
        if (commercialResult.allowed) {
          const storeMessage: MessageDTO = {
            id: newId(),
            role: "assistant",
            content: commercialResult.storeIntro!,
            showStoreButton: true,
            storeProducts: commercialResult.products,
            storeTitle: commercialResult.storeTitle,
            category: gemini.commercialCategory,
            sources: buildActiveSources(input.connectedIntegrations),
          };
          messages.push(storeMessage);
          events.push({ id: newId(), at: input.now.getTime(), title: commercialResult.storeTitle!, action: "shown" });
          commercialOffered = true;
        } else {
          events.push({
            id: newId(),
            at: input.now.getTime(),
            title: gemini.commercialCategory,
            action: "blocked_ethical",
            detail: commercialResult.blockCode,
          });
        }
      }
    }

    return {
      messages,
      events,
      commercialOffered,
      inferredInterest: gemini.inferredInterest ?? undefined,
    };
  } catch (err) {
    console.error("Gemini error, using fallback:", err);
    return fallbackResponse();
  }
}

interface CommercialDecision {
  allowed: boolean;
  products?: Product[];
  storeTitle?: string;
  storeIntro?: string;
  blockCode?: string;
}

function handleCommercialFromGemini(
  category: CommercialCategory,
  input: EngineInput,
): CommercialDecision | null {
  const products = input.getProductsByCategory(category);
  if (products.length === 0) return null;

  const minPrice = Math.min(...products.map((p) => p.price));

  const gate = evaluateEthicalGate({
    userText: input.userText,
    now: input.now,
    userTurnCount: input.userTurnCount,
    category,
    purchases: input.purchases,
    monthlyBudgetEUR: input.monthlyBudgetEUR,
    spendThisMonthEUR: input.spendThisMonthEUR,
    prospectivePriceEUR: minPrice,
    nightProtectionEnabled: input.nightProtectionEnabled,
  });

  if (!gate.allow) {
    return { allowed: false, blockCode: gate.code };
  }

  const STORE_TITLES: Record<CommercialCategory, string> = {
    running: "Running gear",
    skincare: "Skincare",
    books: "Libri consigliati",
    fitness: "Fitness equipment",
    tech: "Tecnologia",
    cooking: "Cucina",
  };

  return {
    allowed: true,
    products,
    storeTitle: STORE_TITLES[category],
    storeIntro: "Ho trovato alcune opzioni che potrebbero interessarti. Se vuoi, dai un'occhiata — nessun obbligo.",
  };
}

function buildActiveSources(connected: ConnectedIntegrations): IntegrationSource[] | undefined {
  const sources: IntegrationSource[] = [];
  if (connected.calendar) sources.push("calendar");
  if (connected.health) sources.push("health");
  if (connected.notes) sources.push("notes");
  if (connected.reminders) sources.push("reminders");
  return sources.length > 0 ? sources : undefined;
}

function fallbackResponse(): EngineResult {
  return {
    messages: [{
      id: newId(),
      role: "assistant",
      content: "Mi scuso, al momento non riesco a connettermi. Posso comunque aiutarti con le integrazioni collegate — prova a chiedermi del calendario, della salute o dei promemoria.",
    }],
    events: [],
    commercialOffered: false,
  };
}
