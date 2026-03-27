import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShoppingBag, Heart, Shield, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

interface OnboardingProps {
  onComplete: (userData: UserPreferences) => void;
}

export interface UserPreferences {
  name: string;
  interests: string[];
  /** True se l’utente entra in chat senza completare nome/interessi (es. “Salta”). */
  guestMode?: boolean;
}

export const INTERESTS_OPTIONS = [
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "skincare", label: "Skincare", emoji: "🧴" },
  { id: "reading", label: "Lettura", emoji: "📚" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "tech", label: "Tecnologia", emoji: "💻" },
  { id: "cooking", label: "Cucina", emoji: "🍳" },
  { id: "wellness", label: "Benessere", emoji: "🌿" },
  { id: "travel", label: "Viaggi", emoji: "✈️" },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = (opts?: { guest?: boolean }) => {
    const guest = opts?.guest === true;
    onComplete({
      name: name.trim() || (guest ? "Ospite" : "Utente"),
      interests: selectedInterests,
      guestMode: guest,
    });
  };

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#3a3a5e] flex items-center justify-center mb-8 shadow-xl shadow-[#1a1a2e]/25">
        <Sparkles size={36} className="text-white" />
      </div>
      <h1 className="text-4xl text-[#1a1a2e] mb-4 tracking-tight">
        Benvenuto in <strong>Senso</strong>
      </h1>
      <p className="text-[#636366] text-lg leading-relaxed mb-10 max-w-md">
        Il tuo assistente personale che capisce le tue esigenze e ti suggerisce solo ciò che è davvero utile per te.
      </p>
      <button
        onClick={() => setStep(1)}
        className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-lg shadow-[#1a1a2e]/20 active:scale-[0.97] transition-transform"
      >
        Iniziamo
        <ChevronRight size={20} />
      </button>
    </motion.div>,

    // Step 1: What is Senso
    <motion.div
      key="what-is-senso"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#34c75915] flex items-center justify-center mb-6">
        <ShoppingBag size={28} className="text-[#34c759]" />
      </div>
      <h2 className="text-2xl text-[#1a1a2e] mb-4">
        Suggerimenti Contestuali
      </h2>
      <p className="text-[#636366] leading-relaxed mb-6 max-w-md">
        Senso analizza le tue conversazioni per suggerirti prodotti <strong>al momento giusto</strong>.
      </p>
      <p className="text-[#636366] text-sm leading-relaxed max-w-md">
        Se parli di "corsa", ti suggeriremo scarpe da running. Se cerchi "skincare", troverai i prodotti perfetti per te.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setStep(0)}
          className="px-6 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e]"
        >
          Indietro
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-md shadow-[#1a1a2e]/15 active:scale-[0.97] transition-transform"
        >
          Continua
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>,

    // Step 2: Privacy
    <motion.div
      key="privacy"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#af52de15] flex items-center justify-center mb-6">
        <Shield size={28} className="text-[#af52de]" />
      </div>
      <h2 className="text-2xl text-[#1a1a2e] mb-4 tracking-tight">
        Privacy First
      </h2>
      <p className="text-[#636366] leading-relaxed mb-4 max-w-md">
        I tuoi dati sono <strong>privati e sicuri</strong>. Non li condividiamo mai con terze parti.
      </p>
      <div className="bg-white/80 rounded-2xl p-6 max-w-md mb-8 border border-[#e5e5ea]/50 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#34c75920] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} className="text-[#34c759]" />
          </div>
          <p className="text-[#1a1a2e] text-sm text-left">
            Nessun dark pattern — CTA equivalenti e trasparenti
          </p>
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#34c75920] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} className="text-[#34c759]" />
          </div>
          <p className="text-[#1a1a2e] text-sm text-left">
            Prodotti ordinati per rilevanza, non per sponsorizzazioni
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#34c75920] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} className="text-[#34c759]" />
          </div>
          <p className="text-[#1a1a2e] text-sm text-left">
            Spiegazioni chiare sul perché ti mostriamo ogni prodotto
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 rounded-xl bg-white/80 text-[#1a1a2e] border border-[#e5e5ea]/50"
        >
          Indietro
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-md shadow-[#1a1a2e]/15 active:scale-[0.97] transition-transform"
        >
          Continua
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>,

    // Step 3: Name
    <motion.div
      key="name"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      <div className="w-full max-w-md">
        <h2 className="text-2xl text-[#1a1a2e] mb-2 text-center">
          Come ti chiami?
        </h2>
        <p className="text-[#636366] text-center mb-8">
          Così potrò rivolgermi a te in modo personale
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Il tuo nome"
          className="w-full px-6 py-4 rounded-2xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none mb-8 text-center text-lg"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 px-6 py-3 rounded-xl bg-white/80 text-[#1a1a2e] border border-[#e5e5ea]/50"
          >
            Indietro
          </button>
          <button
            onClick={() => setStep(4)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-md shadow-[#1a1a2e]/15 active:scale-[0.97] transition-transform"
          >
            Continua
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>,

    // Step 4: Interests
    <motion.div
      key="interests"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-8 py-12"
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={24} className="text-[#ff2d55]" />
          <h2 className="text-2xl text-[#1a1a2e] text-center">
            I tuoi interessi
          </h2>
        </div>
        <p className="text-[#636366] text-center mb-8">
          Seleziona le aree che ti interessano di più
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {INTERESTS_OPTIONS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`px-4 py-4 rounded-2xl border-2 transition-all active:scale-[0.96] ${
                selectedInterests.includes(interest.id)
                  ? "border-[#1a1a2e] bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-md shadow-[#1a1a2e]/15"
                  : "border-[#e5e5ea]/60 bg-white/80 text-[#1a1a2e] shadow-sm"
              }`}
            >
              <span className="text-2xl mb-1 block">{interest.emoji}</span>
              <span className="text-sm">{interest.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep(3)}
            className="flex-1 px-6 py-3 rounded-xl bg-white/80 text-[#1a1a2e] border border-[#e5e5ea]/50"
          >
            Indietro
          </button>
          <button
            onClick={() => handleComplete({ guest: false })}
            disabled={selectedInterests.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white shadow-md shadow-[#1a1a2e]/15 disabled:opacity-30 active:scale-[0.97] transition-transform"
          >
            Inizia
            <Sparkles size={18} />
          </button>
        </div>
      </div>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#e8dfd5] z-[100] flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#e5e5ea]/60">
        <motion.div
          className="h-full bg-gradient-to-r from-[#1a1a2e] to-[#3a3a5e] rounded-r-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>

      {/* Skip button */}
      {step < steps.length - 1 && (
        <button
          type="button"
          onClick={() => handleComplete({ guest: true })}
          className="absolute top-6 right-6 text-[#8e8e93] text-sm"
        >
          Salta
        </button>
      )}
    </div>
  );
}
