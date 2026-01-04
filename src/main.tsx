// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

/**
 * Punto de entrada principal de la aplicación React.
 * Renderiza el componente App dentro del elemento con id "root".
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />

    <App />
  </React.StrictMode>
);
