import { Navigate, useLocation } from "react-router-dom";
import { ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { obterSessaoAtual } from "@/services/autenticacaoService";

export default function RotaProtegida({
  children,
  perfilPermitido,
  perfisPermitidos,
}) {
  const location = useLocation();
  const sessao = obterSessaoAtual();

  if (!sessao || !sessao.token) {
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