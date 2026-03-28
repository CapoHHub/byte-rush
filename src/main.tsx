import { createRoot } from "react-dom/client";
import { AuthProvider } from "./app/context/AuthContext";
import { ProductCatalogProvider } from "./app/context/ProductCatalogContext";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ProductCatalogProvider>
      <App />
    </ProductCatalogProvider>
  </AuthProvider>
);
