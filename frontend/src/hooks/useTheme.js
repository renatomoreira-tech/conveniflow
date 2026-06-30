import { useState, useEffect } from "react";

const STORAGE_KEY = "conveniflow-theme";

function getThemeInicial() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Aplica imediatamente no <html> — evita flash de tema errado no carregamento
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const inicial = getThemeInicial();
    aplicarTema(inicial); // aplica síncrono antes do primeiro render
    return inicial;
  });

  useEffect(() => {
    aplicarTema(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Sincroniza se o usuário mudar a preferência do sistema enquanto o app está aberto
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
