import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Heart,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  Coffee,
  Book,
  Download,
  Trash2,
  Wallet,
  Moon,
  Shield,
} from "lucide-react";
import type { InterestInference, SuggestionEvent } from "../domain/types";

export interface EmotionalIDGoal {
  title: string;
  subtitle: string;
  badge?: string;
  icon: "calendar" | "heart" | "sparkles";
}

interface EmotionalIDProps {
  open: boolean;
  onClose: () => void;
  name: string;
  memberSinceLabel: string;
  bio: string;
  interestChips: { id: string; label: string; emoji: string }[];
  inferredInterests: InterestInference[];
  suggestionHistory: SuggestionEvent[];
  onForgetInference: (id: string) => void;
  onForgetSuggestion: (id: string) => void;
  onExportGdpr: () => void;
  monthlyBudgetEUR: number | null;
  onBudgetChange: (value: number | null) => void;
  spendThisMonthEUR: number;
  goals: EmotionalIDGoal[];
  nightProtectionEnabled: boolean;
  onNightProtectionToggle: () => void;
}

function iconForGoal(kind: EmotionalIDGoal["icon"]) {
  switch (kind) {
    case "calendar":
      return <Calendar size={14} className="text-[#ff9500]" />;
    case "heart":
      return <Heart size={14} className="text-[#ff2d55]" />;
    default:
      return <Sparkles size={14} className="text-[#af52de]" />;
  }
}

export function EmotionalID({
  open,
  onClose,
  name,
  memberSinceLabel,
  bio,
  interestChips,
  inferredInterests,
  suggestionHistory,
  onForgetInference,
  onForgetSuggestion,
  onExportGdpr,
  monthlyBudgetEUR,
  onBudgetChange,
  spendThisMonthEUR,
  goals,
  nightProtectionEnabled,
  onNightProtectionToggle,
}: EmotionalIDProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] lg:w-[480px] bg-white flex flex-col shadow-2xl sm:rounded-l-3xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#af52de] to-[#ff2d55] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-[#1a1a2e] truncate">Carta d’identità</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center flex-shrink-0"
              >
                <X size={16} className="text-[#8e8e93]" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-6">
              <div className="bg-gradient-to-br from-[#f5f0eb] to-[#e8dfd5] rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] flex items-center justify-center text-white text-2xl">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#1a1a2e] text-lg truncate">{name}</p>
                    <p className="text-[#8e8e93] text-sm">{memberSinceLabel}</p>
                  </div>
                </div>
                <p className="text-[#636366] text-sm leading-relaxed">{bio}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Wallet size={18} className="text-[#34c759]" />
                  Budget mensile (opzionale)
                </h3>
                <p className="text-[#8e8e93] text-xs mb-3">
                  Speso questo mese: <strong className="text-[#1a1a2e]">€{spendThisMonthEUR.toFixed(2)}</strong>
                  {monthlyBudgetEUR != null && (
                    <>
                      {" "}
                      / €{monthlyBudgetEUR.toFixed(0)}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onBudgetChange(null)}
                    className={`px-3 py-2 rounded-xl text-sm border ${
                      monthlyBudgetEUR == null
                        ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                        : "border-[#e5e5ea] text-[#1a1a2e]"
                    }`}
                  >
                    Senza limite
                  </button>
                  {[200, 400, 600].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => onBudgetChange(n)}
                      className={`px-3 py-2 rounded-xl text-sm border ${
                        monthlyBudgetEUR === n
                          ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                          : "border-[#e5e5ea] text-[#1a1a2e]"
                      }`}
                    >
                      €{n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-[#636366]" />
                  Protezioni etiche
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Moon size={16} className="text-[#636366] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-[#1a1a2e]">Blocco notturno (23–06)</p>
                        <p className="text-[11px] text-[#8e8e93] leading-snug">Nessun suggerimento d'acquisto di notte</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onNightProtectionToggle}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${nightProtectionEnabled ? "bg-[#34c759]" : "bg-[#d1d1d6]"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${nightProtectionEnabled ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Heart size={18} className="text-[#ff2d55]" />
                  Interessi (onboarding)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interestChips.length === 0 ? (
                    <span className="text-[#8e8e93] text-sm">Nessuno — costruiamoli in chat.</span>
                  ) : (
                    interestChips.map((c) => (
                      <span
                        key={c.id}
                        className="px-3 py-1.5 rounded-full bg-[#f3f3f5] text-[#1a1a2e] text-sm border border-[#e5e5ea]"
                      >
                        <span className="mr-1">{c.emoji}</span>
                        {c.label}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#5ac8fa]" />
                  Rilevati da conversazioni
                </h3>
                <div className="space-y-2">
                  {inferredInterests.length === 0 ? (
                    <p className="text-[#8e8e93] text-sm">
                      Qui appariranno tema e stralcio delle chat che usiamo — sempre visibili.
                    </p>
                  ) : (
                    inferredInterests.map((inf) => (
                      <div
                        key={inf.id}
                        className="bg-[#fafafa] rounded-xl p-3 border border-[#f0f0f0] flex gap-2 items-start"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1a1a2e] text-sm font-medium">{inf.label}</p>
                          <p className="text-[#8e8e93] text-xs mt-1 line-clamp-3">&ldquo;{inf.sourceSnippet}&rdquo;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onForgetInference(inf.id)}
                          className="p-2 rounded-lg bg-[#f3f3f5] text-[#8e8e93]"
                          title="Dimentica questo dato"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Book size={18} className="text-[#af52de]" />
                  Storico suggerimenti
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {suggestionHistory.length === 0 ? (
                    <p className="text-[#8e8e93] text-sm">Ancora nulla — inizia una chat.</p>
                  ) : (
                    [...suggestionHistory].reverse().map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-[#fafafa] rounded-xl p-3 border border-[#f0f0f0] flex gap-2 items-start"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1a1a2e] text-xs">
                            {new Date(ev.at).toLocaleString("it-IT", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-[#1a1a2e] text-sm mt-1">{ev.title}</p>
                          <p className="text-[#8e8e93] text-xs mt-0.5 capitalize">{ev.action.replace("_", " ")}</p>
                          {ev.detail && (
                            <p className="text-[#aeaeb2] text-xs mt-1 font-mono">{ev.detail}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onForgetSuggestion(ev.id)}
                          className="p-2 rounded-lg bg-[#f3f3f5] text-[#8e8e93]"
                          title="Rimuovi voce dallo storico locale"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {goals.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                    <Target size={18} className="text-[#34c759]" />
                    Contesto (demo integrazioni)
                  </h3>
                  <div className="space-y-3">
                    {goals.map((g) => (
                      <div key={g.title} className="bg-[#fafafa] rounded-xl p-4 border border-[#f0f0f0]">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {iconForGoal(g.icon)}
                            <span className="text-[#1a1a2e] text-sm truncate">{g.title}</span>
                          </div>
                          {g.badge && (
                            <span className="text-[#ff9500] text-xs bg-[#ff950020] px-2 py-1 rounded-md flex-shrink-0">
                              {g.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[#8e8e93] text-xs leading-relaxed">{g.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Coffee size={18} className="text-[#ff9500]" />
                  Valori
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Sostenibilità", "Qualità", "Trasparenza", "Benessere", "Autenticità"].map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1.5 rounded-full bg-[#f3f3f5] text-[#1a1a2e] text-sm border border-[#e5e5ea]"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onExportGdpr}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#e5e5ea] text-[#1a1a2e] text-sm mb-4"
              >
                <Download size={16} />
                Esporta i miei dati (JSON)
              </button>

              <div className="bg-[#f3f3f5] rounded-xl p-4 mb-6">
                <p className="text-[#636366] text-xs leading-relaxed">
                  🔒 <strong>Privacy first:</strong> Questa scheda mostra ciò che il prototipo memorizza in locale sul
                  dispositivo. In produzione: export GDPR completo, revoca consensi e cancellazione account.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
