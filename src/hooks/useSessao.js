import { useEffect, useState } from "react";
import { limparSessaoLocal, obterSessaoAtual } from "@/services/autenticacaoService";

export function useSessao() {
  const [sessao, setSessao] = useState(obterSessaoAtual);

  useEffect(() => {
    const sincronizar = () => setSessao(obterSessaoAtual());
    const expirada = () => limparSessaoLocal();
    window.addEventListener("exameja:sessao-alterada", sincronizar);
    window.addEventListener("exameja:sessao-expirada", expirada);
    return () => {
      window.removeEventListener("exameja:sessao-alterada", sincronizar);
      window.removeEventListener("exameja:sessao-expirada", expirada);
    };
  }, []);

  return sessao;
}
