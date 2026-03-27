import type { Product } from "../components/PopupStore";

export type CommercialCategory =
  | "skincare"
  | "running"
  | "books"
  | "fitness"
  | "tech"
  | "cooking";

export interface ConnectedIntegrations {
  calendar: boolean;
  health: boolean;
  notes: boolean;
  reminders: boolean;
}

export const DEFAULT_INTEGRATIONS: ConnectedIntegrations = {
  calendar: false,
  health: false,
  notes: false,
  reminders: false,
};

export interface PurchaseRecord {
  id: string;
  productId: string;
  category: CommercialCategory;
  name: string;
  priceEUR: number;
  at: number;
}

export interface OrderRecord {
  id: string;
  productName: string;
  priceEUR: number;
  orderedAt: number;
  status: "confirmed" | "shipped" | "delivered";
  trackingCode: string;
  estimatedDelivery: string;
  followUpSent: boolean;
}

export type SuggestionAction =
  | "shown"
  | "opened_store"
  | "bought"
  | "not_now"
  | "blocked_ethical";

export interface SuggestionEvent {
  id: string;
  at: number;
  title: string;
  action: SuggestionAction;
  detail?: string;
}

export interface InterestInference {
  id: string;
  label: string;
  sourceSnippet: string;
  at: number;
}

export interface SensoPersistedState {
  purchases: PurchaseRecord[];
  orders: OrderRecord[];
  suggestionHistory: SuggestionEvent[];
  inferredInterests: InterestInference[];
  monthlyBudgetEUR: number | null;
  onboardingCompleted: boolean;
  guestMode: boolean;
  reflectionForPurchaseCountShown: number;
  connectedIntegrations: ConnectedIntegrations;
  nightProtectionEnabled: boolean;
}

export const DEFAULT_PERSISTED: SensoPersistedState = {
  purchases: [],
  orders: [],
  suggestionHistory: [],
  inferredInterests: [],
  monthlyBudgetEUR: null,
  onboardingCompleted: false,
  guestMode: false,
  reflectionForPurchaseCountShown: 0,
  connectedIntegrations: { ...DEFAULT_INTEGRATIONS },
  nightProtectionEnabled: true,
};

export interface MockCalendarEvent {
  title: string;
  date: string;
  daysUntil: number;
  type: "sport" | "health" | "social" | "work" | "wellness";
}

export interface MockHealthData {
  recentRuns: { date: string; km: number; pace: string }[];
  avgKmPerWeek: number;
  avgSleepHours: number;
  dailySteps: number;
  restingHR: number;
}

export interface MockNote {
  text: string;
  date: string;
  tag: string;
}

export interface MockReminder {
  text: string;
  dueIn: string;
  priority: "high" | "medium" | "low";
}

export interface IntegrationContext {
  calendar: MockCalendarEvent[];
  health: MockHealthData;
  notes: MockNote[];
  reminders: MockReminder[];
}

export type IntegrationSource = "calendar" | "health" | "notes" | "reminders";

export interface MessageDTO {
  id: string;
  role: "user" | "assistant";
  content: string;
  showStoreButton?: boolean;
  storeProducts?: Product[];
  storeTitle?: string;
  category?: CommercialCategory;
  sources?: IntegrationSource[];
  /** For integration consent prompt messages. */
  integrationConsentRequest?: keyof ConnectedIntegrations;
}

export type EthicalBlockCode =
  | "EMOTION"
  | "NIGHT"
  | "EARLY_SESSION"
  | "SESSION_CAP"
  | "RECENT_SIMILAR"
  | "BUDGET";

export type EthicalDecision =
  | { allow: true }
  | { allow: false; code: EthicalBlockCode; userFacingHint: string };
