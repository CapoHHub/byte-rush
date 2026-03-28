import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Mail, Lock, User, ChevronRight, AlertCircle, ArrowRight, X, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  asModal?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

type AuthMode = "login" | "register" | "company-login" | "company-register";

export function AuthPage({ asModal, onClose, title, subtitle }: AuthPageProps = {}) {
  const { login, register, companyLogin, companyRegister, skipAuth, error } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;
  const isCompany = mode === "company-login" || mode === "company-register";
  const isRegister = mode === "register" || mode === "company-register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "register") {
        if (!nome.trim() || !cognome.trim()) {
          setLocalError("Nome e cognome sono obbligatori");
          setSubmitting(false);
          return;
        }
        await register(email, password, nome.trim(), cognome.trim());
      } else if (mode === "company-login") {
        await companyLogin(email, password);
      } else if (mode === "company-register") {
        if (!ragioneSociale.trim()) {
          setLocalError("Ragione sociale è obbligatoria");
          setSubmitting(false);
          return;
        }
        await companyRegister(ragioneSociale.trim(), email, password, partitaIva.trim() || undefined);
      }
    } catch {
      // error is already set in context
    } finally {
      setSubmitting(false);
    }
  };

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setNome("");
    setCognome("");
    setRagioneSociale("");
    setPartitaIva("");
    setLocalError(null);
  };

  const switchMode = () => {
    if (isCompany) {
      setMode(mode === "company-login" ? "company-register" : "company-login");
    } else {
      setMode(mode === "login" ? "register" : "login");
    }
    setLocalError(null);
  };

  const toggleCompany = () => {
    resetFields();
    setMode(isCompany ? "login" : "company-login");
  };

  const defaultTitle = isCompany
    ? (isRegister ? "Registra la tua azienda" : "Accesso azienda")
    : (isRegister ? "Crea il tuo account" : "Bentornato");
  const defaultSubtitle = isCompany
    ? (isRegister ? "Carica i tuoi prodotti su Senso" : "Gestisci il tuo catalogo")
    : (isRegister ? "Inizia il tuo percorso con Senso" : "Accedi per continuare con Senso");

  const card = (
    <motion.div
      initial={{ opacity: 0, y: asModal ? 30 : 20, scale: asModal ? 0.97 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={asModal ? { opacity: 0, y: 20, scale: 0.97 } : undefined}
      className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl shadow-black/8 overflow-hidden relative"
    >
      {asModal && onClose && (
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center z-10 hover:bg-[#e5e5ea] transition-colors">
          <X size={16} className="text-[#8e8e93]" />
        </button>
      )}
      <div className="px-8 pt-10 pb-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg ${isCompany ? "bg-gradient-to-br from-[#ff9500] to-[#ff6b00] shadow-[#ff9500]/20" : "bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#3a3a5e] shadow-[#1a1a2e]/20"}`}>
          {isCompany ? <Building2 size={24} className="text-white" /> : <Sparkles size={24} className="text-white" />}
        </div>
        <h1 className="text-2xl font-semibold text-[#1a1a2e] tracking-tight">
          {title || defaultTitle}
        </h1>
        <p className="text-[#8e8e93] text-sm mt-1.5">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 pb-8">
        <AnimatePresence mode="wait">
          {displayError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100"
            >
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{displayError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === "register" && (
            <motion.div key="user-name-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-3">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
              </div>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
                <input type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
              </div>
            </motion.div>
          )}
          {mode === "company-register" && (
            <motion.div key="company-name-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-3">
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
                <input type="text" value={ragioneSociale} onChange={(e) => setRagioneSociale(e.target.value)} placeholder="Ragione sociale" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
              </div>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
                <input type="text" value={partitaIva} onChange={(e) => setPartitaIva(e.target.value)} placeholder="Partita IVA (opzionale)" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3 mb-6">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aeaeb2]" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-[15px] ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform ${isCompany ? "bg-gradient-to-br from-[#ff9500] to-[#ff6b00] shadow-[#ff9500]/20" : "bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] shadow-[#1a1a2e]/20"}`}
        >
          {submitting ? (
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <>
              {isRegister ? "Registrati" : "Accedi"}
              <ChevronRight size={18} />
            </>
          )}
        </button>

        <div className="mt-6 text-center space-y-3">
          <button type="button" onClick={switchMode} className="text-[#8e8e93] text-sm hover:text-[#1a1a2e] transition-colors">
            {isRegister
              ? <>Hai gia un account? <span className="text-[#1a1a2e] font-medium">Accedi</span></>
              : <>{isCompany ? "Non hai un account aziendale?" : "Non hai un account?"} <span className="text-[#1a1a2e] font-medium">Registrati</span></>
            }
          </button>

          <div className="relative flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-[#e5e5ea]" />
            <span className="text-[11px] text-[#aeaeb2] uppercase tracking-wider">oppure</span>
            <div className="flex-1 h-px bg-[#e5e5ea]" />
          </div>

          <button
            type="button"
            onClick={toggleCompany}
            className="flex items-center justify-center gap-1.5 mx-auto text-sm text-[#8e8e93] hover:text-[#1a1a2e] transition-colors group"
          >
            {isCompany ? (
              <>
                <User size={14} />
                Accedi come utente
              </>
            ) : (
              <>
                <Building2 size={14} />
                Sei un'azienda?
              </>
            )}
          </button>

          {!asModal && !isCompany && (
            <button
              type="button"
              onClick={skipAuth}
              className="flex items-center justify-center gap-1.5 mx-auto text-sm text-[#aeaeb2] hover:text-[#8e8e93] transition-colors group"
            >
              Continua senza account
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );

  if (asModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[80]"
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          {card}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#e8dfd5] flex items-center justify-center p-6">
      {card}
    </div>
  );
}
