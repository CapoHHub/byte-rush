import { motion, AnimatePresence } from "motion/react";
import { X, Info, ShoppingBag } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  reason: string;
  sizes?: string[];
}

interface PopupStoreProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  title?: string;
  onBuy?: (product: Product, size?: string) => void;
  /** Rifiuto consapevole sul singolo prodotto — non chiude lo sheet se restano altre schede. */
  onProductNotNow?: (product: Product) => void;
}

export function PopupStore({
  open,
  onClose,
  products,
  title = "Prodotti suggeriti",
  onBuy,
  onProductNotNow,
}: PopupStoreProps) {
  const [reasonOpen, setReasonOpen] = useState<string | null>(null);
  const [sizeSelector, setSizeSelector] = useState<{ product: Product } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const handleBuyClick = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      // Show size selector
      setSizeSelector({ product });
      setSelectedSize("");
    } else {
      // Buy without size
      onBuy?.(product);
    }
  };

  const handleConfirmSize = () => {
    if (sizeSelector && selectedSize) {
      onBuy?.(sizeSelector.product, selectedSize);
      setSizeSelector(null);
      setSelectedSize("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          {/* Store sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-white rounded-t-[24px] flex flex-col mx-auto md:max-w-lg lg:max-w-2xl lg:rounded-3xl lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:max-h-[80vh] lg:shadow-2xl lg:border lg:border-black/5"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-9 h-1 rounded-full bg-[#d1d1d6]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#1a1a2e]" />
                <span className="text-[#1a1a2e]">{title}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#f3f3f5] flex items-center justify-center"
              >
                <X size={16} className="text-[#8e8e93]" />
              </button>
            </div>

            {/* Products */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#fafafa] rounded-2xl p-4 border border-[#f0f0f0]"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#8e8e93] text-sm">{product.brand}</p>
                        <p className="text-[#1a1a2e] mt-0.5 truncate">{product.name}</p>
                        <p className="text-[#1a1a2e] mt-1">€{product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Reason badge */}
                    <button
                      onClick={() => setReasonOpen(reasonOpen === product.id ? null : product.id)}
                      className="flex items-center gap-1.5 mt-3 text-[#8e8e93] text-sm"
                    >
                      <Info size={14} />
                      <span>Perché te lo mostriamo</span>
                    </button>
                    <AnimatePresence>
                      {reasonOpen === product.id && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-sm text-[#636366] mt-2 overflow-hidden"
                        >
                          {product.reason}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* CTAs - visually equivalent */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleBuyClick(product)}
                        className="flex-1 py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm"
                      >
                        Acquista
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onProductNotNow?.(product);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] text-sm border border-[#e5e5ea]"
                      >
                        Non ora
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ethical notice */}
              <p className="text-center text-[#aeaeb2] text-xs mt-6 mb-2">
                I prodotti sono ordinati per rilevanza, non per sponsorizzazione.
                <br />Nessun dark pattern — solo prodotti utili per te.
              </p>
            </div>
          </motion.div>

          {/* Size Selector Modal */}
          <AnimatePresence>
            {sizeSelector && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[60]"
                  onClick={() => setSizeSelector(null)}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl p-6 w-[90%] max-w-sm"
                >
                  <h3 className="text-[#1a1a2e] text-lg mb-2">Seleziona la taglia</h3>
                  <p className="text-[#8e8e93] text-sm mb-4">{sizeSelector.product.name}</p>
                  
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {sizeSelector.product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-xl border-2 text-sm transition-all ${
                          selectedSize === size
                            ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                            : "border-[#e5e5ea] text-[#1a1a2e]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSizeSelector(null)}
                      className="flex-1 py-2.5 rounded-xl bg-[#f3f3f5] text-[#1a1a2e] text-sm"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleConfirmSize}
                      disabled={!selectedSize}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm disabled:opacity-30"
                    >
                      Conferma
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}