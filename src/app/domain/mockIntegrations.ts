import type { IntegrationContext, ConnectedIntegrations } from "./types";

const FULL_CONTEXT: IntegrationContext = {
  calendar: [
    { title: "Mezzamaratona Roma", date: "14 aprile 2026", daysUntil: 18, type: "sport" },
    { title: "Dentista — controllo annuale", date: "2 aprile 2026", daysUntil: 6, type: "health" },
    { title: "Compleanno Marco", date: "8 aprile 2026", daysUntil: 12, type: "social" },
    { title: "Call progetto Alpha", date: "31 marzo 2026", daysUntil: 4, type: "work" },
    { title: "Yoga — lezione di prova", date: "1 aprile 2026", daysUntil: 5, type: "wellness" },
  ],
  health: {
    recentRuns: [
      { date: "26 mar", km: 5.2, pace: "5:30/km" },
      { date: "24 mar", km: 4.8, pace: "5:45/km" },
      { date: "21 mar", km: 6.1, pace: "5:20/km" },
      { date: "19 mar", km: 4.5, pace: "5:50/km" },
    ],
    avgKmPerWeek: 10.3,
    avgSleepHours: 7.2,
    dailySteps: 8500,
    restingHR: 62,
  },
  notes: [
    { text: "Comprare scarpe nuove da corsa", date: "3 marzo 2026", tag: "shopping" },
    { text: "Ricetta risotto zafferano da provare", date: "15 marzo 2026", tag: "cucina" },
    { text: "Idee regalo compleanno Marco: libro, cuffie, buono ristorante", date: "20 marzo 2026", tag: "regalo" },
  ],
  reminders: [
    { text: "Pagare bolletta luce", dueIn: "3 giorni", priority: "high" },
    { text: "Prenotare ristorante per compleanno Marco", dueIn: "10 giorni", priority: "medium" },
    { text: "Rinnovare abbonamento palestra", dueIn: "15 giorni", priority: "low" },
  ],
};

/** Returns only the data for integrations the user has connected. */
export function getIntegrationContext(connected: ConnectedIntegrations): IntegrationContext {
  return {
    calendar: connected.calendar ? FULL_CONTEXT.calendar : [],
    health: connected.health ? FULL_CONTEXT.health : { recentRuns: [], avgKmPerWeek: 0, avgSleepHours: 0, dailySteps: 0, restingHR: 0 },
    notes: connected.notes ? FULL_CONTEXT.notes : [],
    reminders: connected.reminders ? FULL_CONTEXT.reminders : [],
  };
}

export function getFullMockContext(): IntegrationContext {
  return FULL_CONTEXT;
}

export function formatCalendarSummary(ctx: IntegrationContext): string {
  if (ctx.calendar.length === 0) return "";
  const lines = ctx.calendar
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map((ev) => {
      const urgency = ev.daysUntil <= 3 ? "🔴" : ev.daysUntil <= 7 ? "🟡" : "🟢";
      return `${urgency} <strong>${ev.title}</strong> — ${ev.date} (tra ${ev.daysUntil} giorni)`;
    });
  return lines.join("\n");
}

export function formatHealthSummary(ctx: IntegrationContext): string {
  const h = ctx.health;
  if (h.recentRuns.length === 0) return "";
  const runs = h.recentRuns
    .slice(0, 4)
    .map((r) => `  • ${r.date}: ${r.km} km @ ${r.pace}`)
    .join("\n");
  return [
    `<strong>Ultime corse:</strong>\n${runs}`,
    `Media settimanale: ~${h.avgKmPerWeek} km · Sonno: ${h.avgSleepHours}h · Passi/giorno: ${h.dailySteps.toLocaleString("it-IT")} · FC riposo: ${h.restingHR} bpm`,
  ].join("\n\n");
}

export function formatNotes(ctx: IntegrationContext): string {
  if (ctx.notes.length === 0) return "";
  return ctx.notes.map((n) => `📝 <em>${n.date}</em> — ${n.text}`).join("\n");
}

export function formatReminders(ctx: IntegrationContext): string {
  if (ctx.reminders.length === 0) return "";
  const icon = (p: string) => (p === "high" ? "🔴" : p === "medium" ? "🟡" : "🟢");
  return ctx.reminders.map((r) => `${icon(r.priority)} ${r.text} — scade tra ${r.dueIn}`).join("\n");
}

export function buildProactiveSummary(ctx: IntegrationContext): string | null {
  const urgent = ctx.calendar.filter((e) => e.daysUntil <= 3);
  const highReminders = ctx.reminders.filter((r) => r.priority === "high");
  if (urgent.length === 0 && highReminders.length === 0) return null;
  const parts: string[] = [];
  if (urgent.length > 0) {
    parts.push(`📅 Nei prossimi 3 giorni: <strong>${urgent.map((e) => e.title).join("</strong>, <strong>")}</strong>.`);
  }
  if (highReminders.length > 0) {
    parts.push(`⚠️ Promemoria urgente: ${highReminders.map((r) => r.text).join(", ")}.`);
  }
  return parts.join("\n");
}
