import { useCallback, useState } from "react";
import { lerEstadoTeste, salvarEstadoTeste } from "@/services/contasTeste";

export function useEstadoTeste() {
  const [estado, setEstado] = useState(() => salvarEstadoTeste(lerEstadoTeste()));
  const atualizar = useCallback((alterar) => {
    setEstado((atual) => salvarEstadoTeste(alterar(atual)));
  }, []);
  return [estado, atualizar];
}
