import type { Product } from "./PopupStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardStripProps {
  products: Product[];
  onCardClick?: () => void;
}

export function ProductCardStrip({ products, onCardClick }: ProductCardStripProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-3 -mx-1 overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex gap-2.5 px-1" style={{ minWidth: "min-content" }}>
        {products.slice(0, 4).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={onCardClick}
            className="flex-shrink-0 w-[140px] bg-white rounded-xl border border-[#f0f0f0] overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-full h-[90px] bg-[#f3f3f5]">
              {p.image ? (
                <ImageWithFallback
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#aeaeb2] text-2xl">📦</div>
              )}
            </div>
            <div className="px-2.5 py-2">
              <p className="text-[#8e8e93] text-[10px] leading-tight truncate">{p.brand}</p>
              <p className="text-[#1a1a2e] text-xs font-medium leading-tight mt-0.5 truncate">{p.name}</p>
              <p className="text-[#1a1a2e] text-xs font-semibold mt-1">€{p.price.toFixed(2)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
