import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Send,
  Menu,
  User,
  Sparkles,
  ShoppingBag,
  Calendar,
  StickyNote,
  Activity,
  Bell,
  Link as LinkIcon,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "./components/ChatMessage";
import { PopupStore, Product } from "./components/PopupStore";
import { ProductCardStrip } from "./components/ProductCardStrip";
import { EmotionalID, type EmotionalIDGoal } from "./components/EmotionalID";
import { Onboarding, UserPreferences, INTERESTS_OPTIONS } from "./components/Onboarding";
import { AuthPage } from "./components/AuthPage";
import { CompanyDashboard } from "./components/CompanyDashboard";
import { useAuth } from "./context/AuthContext";
import type { CompanyUser } from "./lib/apiService";
import { toast, Toaster } from "sonner";
import { runAssistantTurn, resetGeminiChat } from "./domain/conversationEngine";
import { useCatalog } from "./context/ProductCatalogContext";
import { countPurchasesLastDays } from "./domain/ethicalGate";
import { getIntegrationContext, buildProactiveSummary } from "./domain/mockIntegrations";
import { api } from "./lib/apiService";
import type {
  CommercialCategory,
  PurchaseRecord,
  ConnectedIntegrations,
  IntegrationSource,
} from "./domain/types";
import { DEFAULT_PERSISTED, DEFAULT_INTEGRATIONS } from "./domain/types";
import type { SensoStorageSnapshot } from "./lib/sensoStorage";
import {
  loadSensoSnapshot,
  saveSensoSnapshot,
  clearSensoStorage,
  spendThisCalendarMonthEUR,
  appendSuggestions,
  mergeInferredInterests,
} from "./lib/sensoStorage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  showStoreButton?: boolean;
  storeProducts?: Product[];
  storeTitle?: string;
  storeCategory?: CommercialCategory;
  timestamp?: string;
  sources?: IntegrationSource[];
  integrationConsentRequest?: keyof ConnectedIntegrations;
}

function emptyProfile(): SensoStorageSnapshot {
  return {
    ...DEFAULT_PERSISTED,
    userName: "",
    onboardingInterests: [],
    onboardingCompleted: false,
    guestMode: false,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

const REFLECTION_COPY =
  "Hai ordinato diverse cose di recente. Se ti va, fai una pausa: possiamo organizzare la settimana o chiacchierare — nessuna fretta di comprare. 💬";

const INTEGRATION_META: Record<keyof ConnectedIntegrations, { icon: typeof Calendar; label: string; desc: string; color: string }> = {
  calendar: { icon: Calendar, label: "Calendario", desc: "Prossimi eventi, scadenze, gare (read-only, solo futuri)", color: "#ff9500" },
  health: { icon: Activity, label: "Salute", desc: "Km corsi, sonno, passi, frequenza cardiaca", color: "#34c759" },
  notes: { icon: StickyNote, label: "Note", desc: "Appunti, liste, idee (solo lettura)", color: "#5ac8fa" },
  reminders: { icon: Bell, label: "Promemoria", desc: "To-do, scadenze, reminder urgenti", color: "#af52de" },
};

export default function App() {
  const { user, isGuest, loading: authLoading, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#e8dfd5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <p className="text-[#8e8e93] text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  if (user && user.role === "company") {
    return <CompanyDashboard company={user as CompanyUser} logout={logout} />;
  }

  return <AppChat user={user} logout={logout} />;
}

function AppChat({ user, logout: rawLogout }: { user: { id: number; email: string; nome: string; cognome: string; role?: string } | null; logout: () => void }) {
  const { allProducts, getByCategory } = useCatalog();
  const storageInitRef = useRef(typeof window !== "undefined" ? loadSensoSnapshot() : null);

  const logout = useCallback(() => {
    clearSensoStorage();
    rawLogout();
  }, [rawLogout]);

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => !!storageInitRef.current?.onboardingCompleted);
  const [profile, setProfile] = useState<SensoStorageSnapshot>(() => storageInitRef.current ?? emptyProfile());
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(() =>
    storageInitRef.current
      ? { name: storageInitRef.current.userName, interests: storageInitRef.current.onboardingInterests, guestMode: storageInitRef.current.guestMode }
      : null
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [storeTitle, setStoreTitle] = useState("");
  const [storeCategory, setStoreCategory] = useState<CommercialCategory | null>(null);
  const [emotionalIDOpen, setEmotionalIDOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const prevUserIdRef = useRef<number | null>(user?.id ?? null);
  useEffect(() => {
    if (user) {
      setAuthPromptOpen(false);
      if (prevUserIdRef.current !== user.id) {
        const snap = loadSensoSnapshot();
        if (!snap || !snap.onboardingCompleted) {
          setHasCompletedOnboarding(false);
          setProfile(emptyProfile());
          setUserPreferences(null);
          setMessages([]);
        }
      }
      prevUserIdRef.current = user.id;
    }
  }, [user]);

  const userTurnCountRef = useRef(0);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const proactiveSentRef = useRef(false);

  const spendMonth = useMemo(() => spendThisCalendarMonthEUR(profile.purchases, new Date()), [profile.purchases]);

  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProfile = useCallback((snapshot: SensoStorageSnapshot) => {
    saveSensoSnapshot(snapshot);
    if (!user) return;
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      api.user.settings.update({
        settings: {
          nightProtectionEnabled: snapshot.nightProtectionEnabled,
          monthlyBudgetEUR: snapshot.monthlyBudgetEUR,
          reflectionForPurchaseCountShown: snapshot.reflectionForPurchaseCountShown,
          connectedIntegrations: snapshot.connectedIntegrations,
          onboardingCompleted: snapshot.onboardingCompleted,
          guestMode: snapshot.guestMode,
        },
        onboardingInterests: snapshot.onboardingInterests,
      }).catch((err) => console.error("Settings sync failed:", err));
    }, 500);
  }, [user]);

  // --- Build welcome message based on profile & integrations ---
  const buildWelcomeMessages = useCallback((prefs: UserPreferences | null, prof: SensoStorageSnapshot): Message[] => {
    const now = new Date();
    const name = user?.nome || prefs?.name || prof.userName || "Ospite";
    const hour = now.getHours();
    const greeting = hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";
    const isGuest = prefs?.guestMode;

    const labels = (prefs?.interests ?? prof.onboardingInterests)
      .map((id) => INTERESTS_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");

    let intro: string;
    if (isGuest) {
      intro = `${greeting}! Sono <strong>Senso</strong>. 👋\n\nScrivimi pure: posso organizzare la giornata, controllare eventi, prendere appunti o semplicemente chiacchierare. I suggerimenti d'acquisto arrivano solo quando ha senso — e sempre spiegati.`;
    } else {
      intro = `${greeting} ${name}! Sono <strong>Senso</strong>. 👋\n\n${labels ? `Ti interessano: ${labels}. ` : ""}Chiedimi qualsiasi cosa: calendario, note, promemoria, consigli — lo shopping arriva solo se c'è un bisogno reale.`;
    }

    const msgs: Message[] = [{ id: "welcome", role: "assistant", content: intro, timestamp: formatTime(now) }];

    // Proactive summary if integrations are connected
    const ctx = getIntegrationContext(prof.connectedIntegrations);
    const proactive = buildProactiveSummary(ctx);
    if (proactive && !proactiveSentRef.current) {
      proactiveSentRef.current = true;
      const sources: IntegrationSource[] = [];
      if (prof.connectedIntegrations.calendar) sources.push("calendar");
      if (prof.connectedIntegrations.reminders) sources.push("reminders");
      msgs.push({
        id: "proactive",
        role: "assistant",
        content: proactive,
        timestamp: formatTime(now),
        sources,
      });
    }

    return msgs;
  }, []);

  // Initialize messages on mount or after onboarding
  useEffect(() => {
    if (hasCompletedOnboarding && messages.length === 0) {
      setMessages(buildWelcomeMessages(userPreferences, profile));
    }
  }, [hasCompletedOnboarding]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const logSuggestion = useCallback((events: Parameters<typeof appendSuggestions>[1]) => {
    setProfile((p) => {
      const n = { ...p, suggestionHistory: appendSuggestions(p.suggestionHistory, events) };
      saveProfile(n);
      return n;
    });
  }, []);

  // --- Onboarding ---
  const handleOnboardingComplete = (userData: UserPreferences) => {
    const next: SensoStorageSnapshot = {
      ...profile,
      userName: userData.name,
      onboardingInterests: userData.interests,
      guestMode: userData.guestMode ?? false,
      onboardingCompleted: true,
    };
    saveProfile(next);
    setProfile(next);
    setUserPreferences(userData);
    setHasCompletedOnboarding(true);
    userTurnCountRef.current = 0;
    proactiveSentRef.current = false;
    resetGeminiChat();
    setMessages(buildWelcomeMessages(userData, next));
  };

  // --- Integration consent ---
  const handleConnectIntegration = (key: keyof ConnectedIntegrations) => {
    setProfile((p) => {
      const n: SensoStorageSnapshot = {
        ...p,
        connectedIntegrations: { ...p.connectedIntegrations, [key]: true },
      };
      saveProfile(n);
      return n;
    });
    const meta = INTEGRATION_META[key];
    toast.success(`${meta.label} collegato (demo)`);

    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "assistant",
        content: `Ho collegato <strong>${meta.label}</strong>. Ora posso usare queste informazioni per aiutarti meglio — sono sempre visibili nella Carta d'identità. Riprova la domanda!`,
        timestamp: formatTime(new Date()),
        sources: [key as IntegrationSource],
      },
    ]);
  };

  const toggleIntegration = (key: keyof ConnectedIntegrations) => {
    setProfile((p) => {
      const wasConnected = p.connectedIntegrations[key];
      const n: SensoStorageSnapshot = {
        ...p,
        connectedIntegrations: { ...p.connectedIntegrations, [key]: !wasConnected },
      };
      saveProfile(n);
      return n;
    });
  };

  // --- Send message ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const now = new Date();
    const userMsg: Message = { id: newId(), role: "user", content: text, timestamp: formatTime(now) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    userTurnCountRef.current += 1;
    setIsTyping(true);

    try {
      const pNow = profileRef.current;
      const turnNow = new Date();
      const result = await runAssistantTurn({
        userText: text,
        userTurnCount: userTurnCountRef.current,
        now: turnNow,
        purchases: pNow.purchases,
        monthlyBudgetEUR: pNow.monthlyBudgetEUR,
        spendThisMonthEUR: spendThisCalendarMonthEUR(pNow.purchases, turnNow),
        connectedIntegrations: pNow.connectedIntegrations,
        nightProtectionEnabled: pNow.nightProtectionEnabled,
        getProductsByCategory: getByCategory,
      });

      if (result.inferredInterest && user) {
        api.user.interests.add({
          key: result.inferredInterest.label.toLowerCase().replace(/\s+/g, "_"),
          label: result.inferredInterest.label,
          source: "inferred",
          snippet: result.inferredInterest.snippet,
        }).catch((err) => console.error("Failed to sync interest:", err));
      }

      setProfile((p) => {
        let n = { ...p };
        if (result.events.length) {
          n = { ...n, suggestionHistory: appendSuggestions(p.suggestionHistory, result.events) };
        }
        if (result.inferredInterest) {
          n = { ...n, inferredInterests: mergeInferredInterests(p.inferredInterests, result.inferredInterest.label, result.inferredInterest.snippet, turnNow.getTime()) };
        }
        saveProfile(n);
        return n;
      });

      const assistantMsgs: Message[] = result.messages.map((m) => ({
        id: m.id,
        role: "assistant" as const,
        content: m.content,
        showStoreButton: m.showStoreButton,
        storeProducts: m.storeProducts,
        storeTitle: m.storeTitle,
        storeCategory: m.category,
        timestamp: formatTime(turnNow),
        sources: m.sources,
        integrationConsentRequest: m.integrationConsentRequest,
      }));

      setMessages((prev) => [...prev, ...assistantMsgs]);
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => [...prev, {
        id: newId(),
        role: "assistant",
        content: "Mi scuso, c'è stato un problema. Riprova tra un momento.",
        timestamp: formatTime(new Date()),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Store ---
  const openStore = (products: Product[], title: string, category?: CommercialCategory) => {
    setStoreProducts(products);
    setStoreTitle(title);
    setStoreCategory(category ?? null);
    setStoreOpen(true);
    logSuggestion([{ id: newId(), at: Date.now(), title, action: "opened_store" }]);
  };

  const handleBuy = (product: Product, size?: string) => {
    if (!user) {
      setStoreOpen(false);
      setAuthPromptOpen(true);
      return;
    }
    const category = storeCategory ?? "tech";
    if (profile.monthlyBudgetEUR != null && spendMonth + product.price > profile.monthlyBudgetEUR) {
      toast.message("Budget mensile", { description: `Supereresti il limite di €${profile.monthlyBudgetEUR.toFixed(0)}.` });
      return;
    }

    setStoreOpen(false);
    const sizeText = size ? ` (taglia ${size})` : "";
    toast.success(`${product.name}${sizeText} — ordine registrato (demo).`);

    const purchase: PurchaseRecord = { id: newId(), productId: product.id, category, name: product.name, priceEUR: product.price, at: Date.now() };

    if (user) {
      api.user.purchases.add({
        productId: Number(product.id) || undefined,
        category,
        name: product.name,
        priceEUR: product.price,
      }).catch((err) => console.error("Failed to sync purchase:", err));
    }

    setProfile((p) => {
      const purchases = [...p.purchases, purchase];
      const count30 = countPurchasesLastDays(purchases, new Date(), 30);
      const prevMilestone = p.reflectionForPurchaseCountShown;
      const n: SensoStorageSnapshot = {
        ...p,
        purchases,
        suggestionHistory: appendSuggestions(p.suggestionHistory, [{ id: newId(), at: Date.now(), title: product.name, action: "bought", detail: size }]),
      };
      if (count30 >= 3 && prevMilestone < 3) {
        n.reflectionForPurchaseCountShown = 3;
        queueMicrotask(() => setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: REFLECTION_COPY, timestamp: formatTime(new Date()) }]));
      }
      saveProfile(n);
      return n;
    });

    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "assistant",
        content: `Ottima scelta! Ho registrato <strong>${product.name}</strong>${sizeText}. Ti aggiorno su spedizione qui in chat — e tra qualche giorno ti chiederò come ti trovi. 📦`,
        timestamp: formatTime(new Date()),
      },
    ]);
  };

  const handleProductNotNow = (product: Product) => {
    logSuggestion([{ id: newId(), at: Date.now(), title: product.name, action: "not_now" }]);
    setStoreProducts((prev) => {
      const next = prev.filter((p) => p.id !== product.id);
      if (next.length === 0) setStoreOpen(false);
      return next;
    });
    toast.message("Va benissimo", { description: "Nessuna fretta — restiamo sul dialogo." });
  };

  // --- Emotional ID props ---
  const interestChips = useMemo(() => {
    return (userPreferences?.interests ?? []).map((id) => {
      const o = INTERESTS_OPTIONS.find((x) => x.id === id);
      return { id, label: o?.label ?? id, emoji: o?.emoji ?? "✦" };
    });
  }, [userPreferences]);

  const emotionalGoals = useMemo((): EmotionalIDGoal[] => {
    const goals: EmotionalIDGoal[] = [];
    const ctx = getIntegrationContext(profile.connectedIntegrations);
    const race = ctx.calendar.find((e) => e.type === "sport");
    if (race) {
      goals.push({
        title: race.title,
        subtitle: `${ctx.health.recentRuns.length > 0 ? `Media ~${ctx.health.avgKmPerWeek} km/sett. ` : ""}Allenamento in corso.`,
        badge: `${race.daysUntil} giorni`,
        icon: "calendar",
      });
    }
    const skincare = (userPreferences?.interests ?? []).includes("skincare");
    if (skincare) {
      goals.push({ title: "Routine skincare sostenibile", subtitle: "Preferenza per prodotti cruelty-free (onboarding + chat).", icon: "heart" });
    }
    const notes = ctx.notes.filter((n) => n.tag === "shopping");
    if (notes.length > 0) {
      goals.push({ title: "Nota recente", subtitle: notes.map((n) => n.text).join(", "), icon: "sparkles" });
    }
    return goals;
  }, [userPreferences, profile.connectedIntegrations]);

  const bioText = useMemo(() => {
    if (userPreferences?.guestMode) return "Modalità leggera — la carta cresce con ciò che condividi in chat.";
    const labs = interestChips.map((c) => c.label.toLowerCase());
    if (labs.length === 0) return "Profilo essenziale — continua a parlare per arricchire questa scheda.";
    return `Interessi: ${labs.join(", ")}. Obiettivo: assistenza quotidiana prima dello shopping.`;
  }, [userPreferences?.guestMode, interestChips]);

  const handleExportGdpr = () => {
    const body = JSON.stringify(profile, null, 2);
    const blob = new Blob([body], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senso-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export scaricato (prototipo locale).");
  };

  // --- Render ---
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} initialName={user?.nome} />;
  }

  const connectedCount = Object.values(profile.connectedIntegrations).filter(Boolean).length;

  return (
    <div className="size-full min-h-[100dvh] flex flex-col bg-white">
      <Toaster position="top-center" richColors />

      <div className="w-full min-h-[100dvh] bg-white flex flex-col overflow-hidden flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-[#fafafa] border-b border-[#f0f0f0]">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-5 py-3.5 md:px-6 lg:px-8">
            <button type="button" className="p-2 -ml-1 rounded-xl hover:bg-[#f3f3f5] active:scale-95 transition-all" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} className="text-[#1a1a2e]" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#3a3a5e] flex items-center justify-center shadow-md shadow-[#1a1a2e]/20">
                <Sparkles size={15} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#1a1a2e] font-semibold text-[15px] leading-tight">Senso</span>
                {connectedCount > 0 && (
                  <span className="text-[10px] text-[#34c759] leading-tight">{connectedCount} servizi attivi</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-[#f3f3f5] active:scale-95 transition-all relative"
                onClick={() => openStore(allProducts, "Tutti i prodotti")}
              >
                <ShoppingBag size={19} className="text-[#1a1a2e]" />
              </button>
              <button type="button" className="p-2 -mr-1 rounded-xl hover:bg-[#f3f3f5] active:scale-95 transition-all" onClick={() => setEmotionalIDOpen(true)}>
                <User size={20} className="text-[#1a1a2e]" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-[#fafaf8] to-white">
          <div className="max-w-3xl mx-auto px-4 py-4 md:px-6 lg:px-8">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} sources={msg.sources}>
              {/* Integration consent inline button */}
              {msg.integrationConsentRequest && (
                <button
                  type="button"
                  onClick={() => handleConnectIntegration(msg.integrationConsentRequest!)}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white text-sm w-full justify-center shadow-md shadow-[#1a1a2e]/15 active:scale-[0.97] transition-transform"
                >
                  <LinkIcon size={14} />
                  Connetti {INTEGRATION_META[msg.integrationConsentRequest].label}
                </button>
              )}

              {/* Product cards + Store button */}
              {msg.showStoreButton && msg.storeProducts && (
                <div className="mt-4 flex flex-col gap-2">
                  <ProductCardStrip
                    products={msg.storeProducts}
                    onCardClick={() => openStore(msg.storeProducts!, msg.storeTitle || "Store", msg.storeCategory)}
                  />
                  <motion.button
                    type="button"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openStore(msg.storeProducts!, msg.storeTitle || "Store", msg.storeCategory)}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#3a3a5e] text-white text-sm w-full justify-center shadow-lg shadow-[#1a1a2e]/20 font-medium"
                  >
                    <ShoppingBag size={16} />
                    Esplora opzioni
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.message("Perfetto", { description: "Resto disponibile per il resto." });
                      logSuggestion([{ id: newId(), at: Date.now(), title: msg.storeTitle ?? "Suggerimento", action: "not_now" }]);
                    }}
                    className="text-[#8e8e93] text-xs w-full text-center py-1 underline-offset-2 hover:underline"
                  >
                    No grazie, non ora
                  </button>
                </div>
              )}
            </ChatMessage>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start mb-3">
                <div className="bg-[#f3f3f5] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[6px] h-[6px] rounded-full bg-[#aeaeb2]"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-[#f0f0f0]/80">
          <div className="max-w-3xl mx-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 md:px-6 lg:px-8">
            <div className="flex items-center gap-2.5 bg-[#f3f3f5] rounded-2xl px-4 py-3 ring-1 ring-black/[0.03] focus-within:ring-[#1a1a2e]/20 transition-shadow">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Scrivi qualcosa..."
                className="flex-1 bg-transparent outline-none text-[#1a1a2e] placeholder:text-[#aeaeb2] text-[15px]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] flex items-center justify-center disabled:opacity-20 transition-all active:scale-90 shadow-md shadow-[#1a1a2e]/20"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
            <p className="text-center text-[#c7c7cc] text-[11px] mt-2.5 leading-relaxed">
              Prova: "ciao" · "calendario" · "salute" · "promemoria" · "pianifica" · "corsa" · "skincare"
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar — Integrations */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-full sm:w-[360px] lg:w-[400px] bg-white shadow-2xl flex flex-col sm:rounded-r-3xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea]">
                <div>
                  <p className="text-[#1a1a2e] font-medium">Integrazioni</p>
                  <p className="text-[#8e8e93] text-xs mt-0.5">Collega i servizi — scollegali in qualsiasi momento</p>
                </div>
                <button type="button" onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center">
                  <X size={16} className="text-[#8e8e93]" />
                </button>
              </div>

              <div className="p-5 space-y-3 overflow-y-auto flex-1">
                {(Object.keys(INTEGRATION_META) as Array<keyof ConnectedIntegrations>).map((key) => {
                  const meta = INTEGRATION_META[key];
                  const connected = profile.connectedIntegrations[key];
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="flex items-start gap-3 p-4 rounded-2xl border border-[#f0f0f0] bg-[#fafafa]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                        <Icon size={20} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1a2e] font-medium">{meta.label}</p>
                        <p className="text-xs text-[#8e8e93] leading-snug mt-0.5">{meta.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleIntegration(key)}
                        className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${connected ? "bg-[#34c75920] text-[#34c759]" : "bg-[#f3f3f5] text-[#8e8e93]"}`}
                      >
                        {connected ? "Attivo" : "Collega"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-4 border-t border-[#e5e5ea] space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f3f3f5]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1a2e] font-medium truncate">{user.nome} {user.cognome}</p>
                        <p className="text-[11px] text-[#8e8e93] truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e5e5ea] text-[#8e8e93] text-sm hover:bg-[#f3f3f5] transition-colors"
                    >
                      <LogOut size={14} />
                      Esci
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f3f3f5]">
                      <div className="w-8 h-8 rounded-full bg-[#e5e5ea] flex items-center justify-center text-[#8e8e93] text-xs font-bold flex-shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a1a2e] font-medium">Ospite</p>
                        <p className="text-[11px] text-[#8e8e93]">Crea un account per salvare i dati</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSidebarOpen(false); setAuthPromptOpen(true); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white text-sm font-medium shadow-md shadow-[#1a1a2e]/15 active:scale-[0.98] transition-transform"
                    >
                      <User size={14} />
                      Crea account o accedi
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#aeaeb2] text-xs hover:text-[#8e8e93] transition-colors"
                    >
                      Torna al login
                    </button>
                  </>
                )}
                <p className="text-[11px] text-[#aeaeb2] leading-relaxed">
                  🔒 Prototipo: i dati sono mock locali. In produzione: OAuth2 per servizio, scope minimi, read-only.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Pop-up Store */}
      <PopupStore open={storeOpen} onClose={() => setStoreOpen(false)} products={storeProducts} title={storeTitle} onBuy={handleBuy} onProductNotNow={handleProductNotNow} />

      {/* Emotional ID */}
      <EmotionalID
        open={emotionalIDOpen}
        onClose={() => setEmotionalIDOpen(false)}
        name={userPreferences?.name ?? profile.userName}
        memberSinceLabel={profile.onboardingCompleted ? "Profilo salvato in locale" : "Ospite"}
        bio={bioText}
        interestChips={interestChips}
        inferredInterests={profile.inferredInterests}
        suggestionHistory={profile.suggestionHistory}
        onForgetInference={(id) => {
          setProfile((p) => { const n = { ...p, inferredInterests: p.inferredInterests.filter((x) => x.id !== id) }; saveProfile(n); return n; });
        }}
        onForgetSuggestion={(id) => {
          setProfile((p) => { const n = { ...p, suggestionHistory: p.suggestionHistory.filter((x) => x.id !== id) }; saveProfile(n); return n; });
        }}
        onExportGdpr={handleExportGdpr}
        monthlyBudgetEUR={profile.monthlyBudgetEUR}
        onBudgetChange={(v) => {
          setProfile((p) => { const n = { ...p, monthlyBudgetEUR: v }; saveProfile(n); return n; });
        }}
        spendThisMonthEUR={spendMonth}
        goals={emotionalGoals}
        nightProtectionEnabled={profile.nightProtectionEnabled}
        onNightProtectionToggle={() => {
          setProfile((p) => { const n = { ...p, nightProtectionEnabled: !p.nightProtectionEnabled }; saveProfile(n); return n; });
        }}
      />

      {/* Auth prompt for guest users */}
      {authPromptOpen && (
        <AuthPage
          asModal
          onClose={() => setAuthPromptOpen(false)}
          title="Crea un account"
          subtitle="Per acquistare e salvare i tuoi dati tra le sessioni"
        />
      )}
    </div>
  );
}
