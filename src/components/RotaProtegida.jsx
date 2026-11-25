import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { obterSessaoAtual, limparSessaoLocal, validarSessaoAtual } from "@/services/autenticacaoService";

export default function RotaProtegida({
  children,
  perfilPermitido,
  perfisPermitidos,
}) {
  const location = useLocation();
  const [sessao, setSessao] = useState(obterSessaoAtual);
  const [validando, setValidando] = useState(true);
  const [falhaValidacao, setFalhaValidacao] = useState(false);

  useEffect(() => {
    let ativo = true;
    const sincronizar = () => setSessao(obterSessaoAtual());
    const expirada = () => {
      limparSessaoLocal();
      setSessao(null);
    };
    window.addEventListener("exameja:sessao-alterada", sincronizar);
    window.addEventListener("exameja:sessao-expirada", expirada);
    validarSessaoAtual()
      .then((atual) => {
        if (ativo) setSessao(atual);
      })
      .catch(() => {
        if (ativo) setFalhaValidacao(true);
      })
      .finally(() => {
        if (ativo) setValidando(false);
      });
    return () => {
      ativo = false;
      window.removeEventListener("exameja:sessao-alterada", sincronizar);
      window.removeEventListener("exameja:sessao-expirada", expirada);
    };
  }, []);

  if (validando) return null;
  if (falhaValidacao) return <p role="alert" style={{ padding: "2rem" }}>Não foi possível validar sua sessão com o servidor. Verifique a conexão e tente novamente.</p>;

  if (!sessao?.autenticado) {
    const destino = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${destino}`} replace />;
  }

  const listaPermitida = perfisPermitidos
    ? perfisPermitidos
    : perfilPermitido
      ? [perfilPermitido]
      : [];

  if (listaPermitida.length > 0 && !listaPermitida.includes(sessao.perfil)) {
    const rotaDestino = ROTA_INICIAL_PERFIL[sessao.perfil] || "/";
    return <Navigate to={rotaDestino} replace />;
  }

  return children;
}
