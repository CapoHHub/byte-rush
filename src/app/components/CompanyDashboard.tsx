import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Plus, Pencil, Trash2, X, LogOut, Sparkles, Save, Image, Tag, FileText, DollarSign, Layers } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api, type DbProduct, type CompanyUser } from "../lib/apiService";

const CATEGORIES = [
  { value: "", label: "Nessuna categoria" },
  { value: "running", label: "Running" },
  { value: "skincare", label: "Skincare" },
  { value: "books", label: "Libri" },
  { value: "fitness", label: "Fitness" },
  { value: "tech", label: "Tecnologia" },
  { value: "cooking", label: "Cucina" },
];

interface ProductFormData {
  nome: string;
  descrizione: string;
  prezzo: string;
  immagine: string;
  categoria: string;
  motivazione: string;
  taglie: string;
}

const EMPTY_FORM: ProductFormData = {
  nome: "",
  descrizione: "",
  prezzo: "",
  immagine: "",
  categoria: "",
  motivazione: "",
  taglie: "",
};

export function CompanyDashboard({ company, logout }: { company: CompanyUser; logout: () => void }) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { products: p } = await api.company.products.list();
      setProducts(p);
    } catch {
      toast.error("Errore nel caricamento dei prodotti");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (p: DbProduct) => {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      descrizione: p.descrizione ?? "",
      prezzo: String(p.prezzo),
      immagine: p.immagine ?? "",
      categoria: p.categoria ?? "",
      motivazione: p.motivazione ?? "",
      taglie: Array.isArray(p.taglie) ? (p.taglie as string[]).join(", ") : "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.prezzo.trim()) {
      toast.error("Nome e prezzo sono obbligatori");
      return;
    }
    if (!form.categoria) {
      toast.error("Seleziona una categoria per rendere il prodotto suggeribile in chat");
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        nome: form.nome.trim(),
        descrizione: form.descrizione.trim() || undefined,
        prezzo: parseFloat(form.prezzo),
        immagine: form.immagine.trim() || undefined,
        categoria: form.categoria || undefined,
        motivazione: form.motivazione.trim() || undefined,
        taglie: form.taglie.trim() ? form.taglie.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      };

      if (editingId) {
        await api.company.products.update(editingId, data);
        toast.success("Prodotto aggiornato");
      } else {
        await api.company.products.create(data);
        toast.success("Prodotto creato");
      }
      setFormOpen(false);
      fetchProducts();
    } catch {
      toast.error("Errore nel salvataggio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.company.products.remove(id);
      toast.success("Prodotto eliminato");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  const handleToggleActive = async (p: DbProduct) => {
    try {
      await api.company.products.update(p.id, { attivo: !p.attivo });
      fetchProducts();
      toast.success(p.attivo ? "Prodotto disattivato" : "Prodotto attivato");
    } catch {
      toast.error("Errore nell'aggiornamento");
    }
  };

  return (
    <div className="size-full min-h-[100dvh] bg-gradient-to-br from-[#f5f0eb] via-[#ede5dc] to-[#e8dfd5] flex items-center justify-center p-0 lg:p-6">
      <Toaster position="top-center" richColors />

      <div className="w-full min-h-[100dvh] lg:min-h-0 lg:h-[min(92vh,860px)] max-w-[720px] mx-auto bg-white flex flex-col overflow-hidden lg:rounded-3xl lg:shadow-2xl lg:border lg:border-black/5">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-semibold text-[15px] leading-tight">{company.ragioneSociale}</p>
              <p className="text-white/70 text-xs">{company.email}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors">
            <LogOut size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#1a1a2e]" />
            <span className="text-[#1a1a2e] font-medium">Prodotti ({products.length})</span>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white text-sm font-medium shadow-md active:scale-[0.97] transition-transform"
          >
            <Plus size={14} />
            Aggiungi
          </button>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-6 h-6 border-2 border-[#aeaeb2]/30 border-t-[#aeaeb2] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package size={40} className="text-[#d1d1d6] mb-4" />
              <p className="text-[#8e8e93] text-sm">Nessun prodotto ancora.</p>
              <p className="text-[#aeaeb2] text-xs mt-1">Clicca "Aggiungi" per iniziare.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${p.attivo ? "border-[#f0f0f0] bg-[#fafafa]" : "border-[#e5e5ea] bg-[#f3f3f5] opacity-60"}`}>
                  {p.immagine ? (
                    <img src={p.immagine} alt={p.nome} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-white" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#e5e5ea] flex items-center justify-center flex-shrink-0">
                      <Image size={20} className="text-[#aeaeb2]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[#1a1a2e] font-medium text-sm truncate">{p.nome}</p>
                        <p className="text-[#8e8e93] text-xs mt-0.5">{Number(p.prezzo).toFixed(2)} EUR</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {p.categoria && (
                          <span className="px-2 py-0.5 rounded-md bg-[#ff950015] text-[#ff9500] text-[10px] font-medium">{p.categoria}</span>
                        )}
                      </div>
                    </div>
                    {p.descrizione && <p className="text-[#aeaeb2] text-xs mt-1 line-clamp-1">{p.descrizione}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={() => openEditForm(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f3f3f5] text-[#636366] text-xs hover:bg-[#e5e5ea] transition-colors">
                        <Pencil size={12} /> Modifica
                      </button>
                      <button type="button" onClick={() => handleToggleActive(p)} className="px-2.5 py-1.5 rounded-lg bg-[#f3f3f5] text-[#636366] text-xs hover:bg-[#e5e5ea] transition-colors">
                        {p.attivo ? "Disattiva" : "Attiva"}
                      </button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs hover:bg-red-100 transition-colors">
                        <Trash2 size={12} /> Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={() => setFormOpen(false)} />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] max-h-[90vh] bg-white rounded-t-[24px] flex flex-col max-w-[560px] mx-auto lg:rounded-3xl lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:max-h-[85vh] lg:shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea]">
                <h3 className="text-[#1a1a2e] font-medium">{editingId ? "Modifica prodotto" : "Nuovo prodotto"}</h3>
                <button type="button" onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center">
                  <X size={16} className="text-[#8e8e93]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><Tag size={12} /> Nome *</label>
                  <input type="text" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome del prodotto" required className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><FileText size={12} /> Descrizione</label>
                  <textarea value={form.descrizione} onChange={(e) => setForm((f) => ({ ...f, descrizione: e.target.value }))} placeholder="Descrizione breve" rows={2} className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><DollarSign size={12} /> Prezzo (EUR) *</label>
                    <input type="number" step="0.01" min="0" value={form.prezzo} onChange={(e) => setForm((f) => ({ ...f, prezzo: e.target.value }))} placeholder="0.00" required className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><Layers size={12} /> Categoria</label>
                    <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><Image size={12} /> URL Immagine</label>
                  <input type="url" value={form.immagine} onChange={(e) => setForm((f) => ({ ...f, immagine: e.target.value }))} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><FileText size={12} /> Motivazione (perche lo mostriamo)</label>
                  <textarea value={form.motivazione} onChange={(e) => setForm((f) => ({ ...f, motivazione: e.target.value }))} placeholder="Spiega brevemente perche questo prodotto e' utile..." rows={2} className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow resize-none" />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs text-[#8e8e93] mb-1.5"><Tag size={12} /> Taglie (separate da virgola)</label>
                  <input type="text" value={form.taglie} onChange={(e) => setForm((f) => ({ ...f, taglie: e.target.value }))} placeholder="es: 39, 40, 41, 42" className="w-full px-4 py-3 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] placeholder:text-[#aeaeb2] outline-none text-sm ring-1 ring-black/[0.03] focus:ring-[#1a1a2e]/20 transition-shadow" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#3a3a5e] text-white font-medium shadow-lg shadow-[#1a1a2e]/20 disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {submitting ? (
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? "Aggiorna" : "Crea prodotto"}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
