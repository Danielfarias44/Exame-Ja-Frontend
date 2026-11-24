import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import RotaProtegida from "@/components/RotaProtegida";
import { PERFIS } from "@/constants/perfis";

const LayoutPublico = lazy(() => import("@/layouts/LayoutPublico"));
const PaginaInicial = lazy(() => import("@/pages/paciente_deslogado/PaginaInicial"));
const PaginaCadastro = lazy(() => import("@/pages/paciente_deslogado/PaginaCadastro"));
const PaginaLogin = lazy(() => import("@/pages/paciente_deslogado/PaginaLogin"));
const RecuperacaoAcesso = lazy(() => import("@/pages/paciente_deslogado/RecuperacaoAcesso"));

const SearchResults = lazy(() => import("@/pages/paciente_deslogado/SearchResults"));
const EstablishmentDetails = lazy(() => import("@/pages/paciente_deslogado/EstablishmentDetails"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));

const LayoutLogado = lazy(() => import("@/layouts/LayoutLogado"));
const HomeLogado = lazy(() => import("@/pages/paciente_logado/HomeLogado"));
const CompararExames = lazy(() => import("@/pages/paciente_logado/CompararExames"));
const Perfil = lazy(() => import("@/pages/paciente_logado/Perfil"));
const Agendamento = lazy(() => import("@/pages/paciente_logado/Agendamento"));
const MeusAgendamentos = lazy(() => import("@/pages/paciente_logado/MeusAgendamentos"));
const Historico = lazy(() => import("@/pages/paciente_logado/Historico"));
const Avaliacao = lazy(() => import("@/pages/paciente_logado/Avaliacao"));
const Notificacoes = lazy(() => import("@/pages/paciente_logado/Notificacoes"));
const Chat = lazy(() => import("@/pages/paciente_logado/Chat"));
const MapaCompleto = lazy(() => import("@/pages/paciente_logado/MapaCompleto"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Área pública e autenticação */}
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/recuperar-acesso" element={<RecuperacaoAcesso />} />
          <Route path="/busca" element={<SearchResults />} />
        </Route>

        {/* Área logada protegida do paciente */}
        <Route
          path="/paciente"
          element={
            <RotaProtegida perfilPermitido={PERFIS.PACIENTE}>
              <LayoutLogado />
            </RotaProtegida>
          }
        >
          <Route index element={<HomeLogado />} />
          <Route path="comparar" element={<CompararExames />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="agendar" element={<Agendamento />} />
          <Route path="agendamentos" element={<MeusAgendamentos />} />
          <Route path="historico" element={<Historico />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="chat" element={<Chat />} />
          <Route path="mapa" element={<MapaCompleto />} />
          <Route path="estabelecimento/:id" element={<EstablishmentDetails />} />
          <Route path="*" element={<Navigate to="/paciente" replace />} />
        </Route>

        {/* Demais telas do fluxo público */}
        <Route element={<MainLayout />}>
          <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
          <Route path="/styleguide" element={<Styleguide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}