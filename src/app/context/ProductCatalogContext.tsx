import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { api, type DbProduct } from "../lib/apiService";
import type { Product } from "../components/PopupStore";
import type { CommercialCategory } from "../domain/types";

function dbToFrontend(p: DbProduct): Product {
  return {
    id: String(p.id),
    name: p.nome,
    brand: p.company?.ragioneSociale ?? "Senso",
    price: Number(p.prezzo),
    image: p.immagine ?? "",
    reason: p.motivazione ?? "",
    sizes: Array.isArray(p.taglie) ? (p.taglie as string[]) : undefined,
  };
}

interface CatalogState {
  allProducts: Product[];
  getByCategory: (cat: CommercialCategory) => Product[];
  loading: boolean;
  refresh: () => void;
}

const CatalogContext = createContext<CatalogState | null>(null);

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const { products } = await api.products.list();
      setRaw(products);
    } catch (err) {
      console.error("Failed to fetch product catalog:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const allProducts = useMemo(() => raw.map(dbToFrontend), [raw]);
  const getByCategory = useCallback(
    (cat: CommercialCategory) => raw.filter((p) => p.categoria === cat).map(dbToFrontend),
    [raw],
  );

  return (
    <CatalogContext.Provider value={{ allProducts, getByCategory, loading, refresh: fetchAll }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within ProductCatalogProvider");
  return ctx;
}
