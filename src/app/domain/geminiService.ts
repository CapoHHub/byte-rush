import { GoogleGenerativeAI, type ChatSession } from "@google/generative-ai";
import type { ConnectedIntegrations, IntegrationContext, CommercialCategory, IntegrationSource } from "./types";
import { getIntegrationContext, formatCalendarSummary, formatHealthSummary, formatNotes, formatReminders } from "./mockIntegrations";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export interface GeminiStructuredResponse {
  text: string;
  commercialCategory: CommercialCategory | null;
  sources: IntegrationSource[];
  inferredInterest: { label: string; snippet: string } | null;
  needsIntegration: keyof ConnectedIntegrations | null;
}

const AVAILABLE_CATEGORIES: CommercialCategory[] = ["running", "skincare", "books", "fitness", "tech", "cooking"];

const SYSTEM_INSTRUCTION = `Sei **Senso**, un assistente conversazionale personale etico. Parli in italiano.

## La tua identità
- Sei un assistente quotidiano: aiuti a pianificare, organizzare, ricordare, dare consigli genuini.
- Lo shopping NON è il tuo obiettivo. È una conseguenza naturale se l'utente ha un bisogno reale.
- Sei empatico, conciso, e non invadente.
- Usi HTML semplice (<strong>, <em>) per enfasi nel testo.

## Regole etiche
- Se l'utente esprime stress, ansia, tristezza → NON suggerire MAI acquisti. Supportalo emotivamente.
- Non usare mai urgenza, scarsità, pressione sociale o dark patterns.
- Ogni suggerimento deve essere genuinamente utile e spiegato.

## Quando suggerire una categoria commerciale
Imposta commercialCategory quando:
1. L'utente menziona un argomento collegato a una categoria (corsa, pelle, libri, allenamento, tecnologia, cucina)
2. L'utente chiede consigli, raccomandazioni o aiuto su un tema collegato a una categoria
3. Il contesto delle integrazioni mostra un bisogno (es. gara in calendario → running, nota su "comprare scarpe" → running)
4. L'utente parla di hobby, interessi o attivita che hanno prodotti correlati

Sii PROATTIVO: se il tema della conversazione e anche vagamente collegato a una categoria, imposta commercialCategory. Il sistema decidera se mostrare i prodotti in base alle regole etiche. E meglio suggerire troppo che troppo poco — il filtro etico fara il resto.

Le categorie disponibili sono: ${AVAILABLE_CATEGORIES.join(", ")}.

## Integrazioni
Quando il contesto delle integrazioni è disponibile, usalo per dare risposte più ricche e personalizzate.
Se l'utente chiede qualcosa che richiederebbe un'integrazione NON collegata, imposta needsIntegration con la chiave corrispondente.

## Formato di risposta
Rispondi SEMPRE e SOLO con un oggetto JSON valido (senza markdown code fences):
{
  "text": "la tua risposta all'utente",
  "commercialCategory": null,
  "sources": [],
  "inferredInterest": null,
  "needsIntegration": null
}

- text: la risposta conversazionale (HTML leggero OK)
- commercialCategory: null oppure una delle categorie se rilevi un bisogno reale
- sources: array di integrazioni usate nella risposta ("calendar", "health", "notes", "reminders")
- inferredInterest: { "label": "etichetta", "snippet": "frase utente" } se rilevi un nuovo interesse
- needsIntegration: "calendar" | "health" | "notes" | "reminders" se serve un dato non disponibile`;

let chatSession: ChatSession | null = null;
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export function resetGeminiChat(): void {
  chatSession = null;
}

function buildContextBlock(connected: ConnectedIntegrations): string {
  const ctx = getIntegrationContext(connected);
  const sections: string[] = [];

  sections.push(`[Integrazioni collegate: ${Object.entries(connected).filter(([, v]) => v).map(([k]) => k).join(", ") || "nessuna"}]`);

  if (connected.calendar) {
    const cal = formatCalendarSummary(ctx);
    if (cal) sections.push(`[CALENDARIO]\n${stripHtml(cal)}`);
  }

  if (connected.health) {
    const health = formatHealthSummary(ctx);
    if (health) sections.push(`[SALUTE]\n${stripHtml(health)}`);
  }

  if (connected.notes) {
    const notes = formatNotes(ctx);
    if (notes) sections.push(`[NOTE]\n${stripHtml(notes)}`);
  }

  if (connected.reminders) {
    const rem = formatReminders(ctx);
    if (rem) sections.push(`[PROMEMORIA]\n${stripHtml(rem)}`);
  }

  return sections.join("\n\n");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export async function sendToGemini(
  userText: string,
  connected: ConnectedIntegrations,
): Promise<GeminiStructuredResponse> {
  const client = getClient();

  if (!chatSession) {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    chatSession = model.startChat({ history: [] });
  }

  const contextBlock = buildContextBlock(connected);
  const fullMessage = `${contextBlock}\n\n---\nMessaggio utente: ${userText}`;

  const result = await chatSession.sendMessage(fullMessage);
  const raw = result.response.text();

  return parseGeminiResponse(raw);
}

function parseGeminiResponse(raw: string): GeminiStructuredResponse {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      text: typeof parsed.text === "string" ? parsed.text : "Mi scuso, non sono riuscito a elaborare la risposta.",
      commercialCategory: AVAILABLE_CATEGORIES.includes(parsed.commercialCategory) ? parsed.commercialCategory : null,
      sources: Array.isArray(parsed.sources) ? parsed.sources.filter((s: string) => ["calendar", "health", "notes", "reminders"].includes(s)) : [],
      inferredInterest: parsed.inferredInterest && typeof parsed.inferredInterest.label === "string"
        ? { label: parsed.inferredInterest.label, snippet: parsed.inferredInterest.snippet ?? "" }
        : null,
      needsIntegration: parsed.needsIntegration && ["calendar", "health", "notes", "reminders"].includes(parsed.needsIntegration)
        ? parsed.needsIntegration
        : null,
    };
  } catch {
    return {
      text: raw || "Non sono riuscito a elaborare la risposta. Riprova.",
      commercialCategory: null,
      sources: [],
      inferredInterest: null,
      needsIntegration: null,
    };
  }
}

export function isGeminiAvailable(): boolean {
  return !!API_KEY;
}
