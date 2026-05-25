import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";
import { createI18n, setSharedI18n } from "@mity-garden/i18n";
import "./styles/global.css";

// Initialize i18n before mounting
const i18n = createI18n({ locale: "en" });
setSharedI18n(i18n);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
