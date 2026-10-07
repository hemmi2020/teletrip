import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/App.css";
import App from "./App.jsx";

// Handle Vite dynamic import / chunk loading errors after new deployment
window.addEventListener("vite:preloadError", () => {
  console.warn("New version detected, refreshing assets...");
  const key = "vite_chunk_reload";
  const last = sessionStorage.getItem(key);
  if (!last || Date.now() - parseInt(last, 10) > 10000) {
    sessionStorage.setItem(key, Date.now().toString());
    window.location.reload();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
