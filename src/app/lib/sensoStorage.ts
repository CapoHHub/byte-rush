import type { PurchaseRecord, SensoPersistedState, SuggestionEvent, InterestInference, ConnectedIntegrations } from "../domain/types";
import { DEFAULT_PERSISTED, DEFAULT_INTEGRATIONS } from "../domain/types";

const STORAGE_KEY = "senso:v1";

export interface SensoStorageSnapshot extends SensoPersistedState {
  userName: string;
  onboardingInterests: string[];
}

export function loadSensoSnapshot(): SensoStorageSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SensoStorageSnapshot>;
    if (!parsed.onboardingCompleted) return null;
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      purchases: parsed.purchases ?? [],
      orders: parsed.orders ?? [],
      suggestionHistory: parsed.suggestionHistory ?? [],
      inferredInterests: parsed.inferredInterests ?? [],
      connectedIntegrations: { ...DEFAULT_INTEGRATIONS, ...(parsed.connectedIntegrations ?? {}) },
    nightProtectionEnabled: parsed.nightProtectionEnabled !== false,
      userName: parsed.userName ?? "Utente",
      onboardingInterests: parsed.onboardingInterests ?? [],
      monthlyBudgetEUR: parsed.monthlyBudgetEUR === undefined ? null : parsed.monthlyBudgetEUR,
    };
  } catch {
    return null;
  }
}

export function saveSensoSnapshot(s: SensoStorageSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function clearSensoStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function spendThisCalendarMonthEUR(purchases: PurchaseRecord[], now: Date): number {
  const y = now.getFullYear();
  const m = now.getMonth();
  return purchases
    .filter((p) => { const d = new Date(p.at); return d.getFullYear() === y && d.getMonth() === m; })
    .reduce((acc, p) => acc + p.priceEUR, 0);
}

export function appendSuggestions(prev: SuggestionEvent[], next: SuggestionEvent[], max = 80): SuggestionEvent[] {
  return [...prev, ...next].slice(-max);
}

export function mergeInferredInterests(prev: InterestInference[], label: string, snippet: string, at: number, max = 24): InterestInference[] {
  const id = newId();
  const entry: InterestInference = { id, label, sourceSnippet: snippet, at };
  const filtered = prev.filter((x) => !(x.label === label && x.sourceSnippet === snippet));
  return [...filtered, entry].slice(-max);
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
