import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import PrivyProvider from "./providers/PrivyProvider.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PrivyProvider>
  </StrictMode>,
);
