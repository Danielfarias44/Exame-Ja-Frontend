import { useCallback, useEffect, useState } from "react";

const CHAVE_TEMA = "exame-ja-tema";
const CHAVE_CHAKRA_TEMA = "theme";
const EVENTO_TEMA = "exame-ja-tema-alterado";

function obterTemaInicial() {
  if (typeof window === "undefined") return "light";
  const salvo = window.localStorage.getItem(CHAVE_TEMA);
  if (salvo === "dark" || salvo === "light") return salvo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function aplicarTemaNoDocumento(novoTema) {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;
  const ehEscuro = novoTema === "dark";

  raiz.classList.toggle("dark", ehEscuro);
  raiz.classList.toggle("light", !ehEscuro);
  raiz.setAttribute("data-theme", novoTema);
  raiz.style.colorScheme = novoTema;

  window.localStorage.setItem(CHAVE_TEMA, novoTema);
  window.localStorage.setItem(CHAVE_CHAKRA_TEMA, novoTema);
}

/**
 * Hook sincronizado para gerenciar e persistir o tema (claro ou escuro)
 * em conjunto com os tokens CSS e o ColorModeProvider do Chakra UI v3.
 */
export function useTema() {
  const [tema, setTema] = useState(obterTemaInicial);

  useEffect(() => {
    aplicarTemaNoDocumento(tema);
  }, [tema]);

  useEffect(() => {
    function aoMudarTema(evento) {
      const proximo = evento.detail;
      if (proximo === "dark" || proximo === "light") {
        setTema(proximo);
      }
    }
    window.addEventListener(EVENTO_TEMA, aoMudarTema);
    return () => window.removeEventListener(EVENTO_TEMA, aoMudarTema);
  }, []);

  const alternarTema = useCallback(() => {
    const atual =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const proximo = atual === "dark" ? "light" : "dark";

    aplicarTemaNoDocumento(proximo);
    window.dispatchEvent(new CustomEvent(EVENTO_TEMA, { detail: proximo }));
  }, []);

  return {
    tema,
    ehEscuro: tema === "dark",
    alternarTema,
  };
}