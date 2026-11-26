import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import RotaProtegida from "@/components/RotaProtegida";
import { PERFIS } from "@/constants/perfis";
import { ehPaciente } from "@/services/autenticacaoService";
import { useSessao } from "@/hooks/useSessao";

const LayoutPublico = lazy(() => import("@/layouts/LayoutPublico"));
const PaginaInicial = lazy(() => import("@/pages/paciente_deslogado/PaginaInicial"));
const PaginaCadastro = lazy(() => import("@/pages/paciente_deslogado/PaginaCadastro"));
const PaginaLogin = lazy(() => import("@/pages/paciente_deslogado/PaginaLogin"));
const RecuperacaoAcesso = lazy(() => import("@/pages/paciente_deslogado/RecuperacaoAcesso"));

const SearchResults = lazy(() => import("@/pages/paciente_deslogado/SearchResults"));
const EstablishmentDetails = lazy(() => import("@/pages/paciente_deslogado/EstablishmentDetails"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));

const LayoutLogado = lazy(() => import("@/layouts/LayoutLogado"));
const Perfil = lazy(() => import("@/pages/paciente_logado/Perfil"));
const Notificacoes = lazy(() => import("@/pages/paciente_logado/Notificacoes"));
const Chat = lazy(() => import("@/pages/paciente_logado/Chat"));
const MapaCompleto = lazy(() => import("@/pages/paciente_logado/MapaCompleto"));
const Agendamento = lazy(() => import("@/pages/paciente_logado/Agendamento"));
const MeusAgendamentos = lazy(() => import("@/pages/paciente_logado/MeusAgendamentos"));
const Historico = lazy(() => import("@/pages/paciente_logado/Historico"));
const Avaliacao = lazy(() => import("@/pages/paciente_logado/Avaliacao"));
const RecursoIndisponivel = lazy(() => import("@/pages/paciente_logado/RecursoIndisponivel"));
const ClinicaDashboard = lazy(() => import("@/pages/clinica/ClinicaDashboard"));
const ClinicaChat = lazy(() => import("@/pages/clinica/ClinicaChat"));
const AdminClinicas = lazy(() => import("@/pages/admin/AdminClinicas"));

function BuscaLayout() {
  const sessao = useSessao();
  return ehPaciente(sessao) ? <LayoutLogado /> : <LayoutPublico />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Área pública e autenticação */}
        <Route element={<BuscaLayout />}>
          <Route path="/busca" element={<SearchResults />} />
          <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
        </Route>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/recuperar-acesso" element={<RecuperacaoAcesso />} />
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
          <Route index element={<SearchResults />} />
          <Route path="comparar" element={<RecursoIndisponivel titulo="Comparação lado a lado indisponível" descricao="A API não oferece um comparador. Consulte as clínicas na busca e ordene as ofertas por distância ou preço." />} />
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

        <Route path="/admin" element={<RotaProtegida perfilPermitido={PERFIS.ADMIN}><Outlet /></RotaProtegida>}>
          <Route index element={<AdminClinicas />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route
          path="/clinica"
          element={
            <RotaProtegida perfilPermitido={PERFIS.CLINICA}>
              <Outlet />
            </RotaProtegida>
          }
        >
          <Route index element={<ClinicaDashboard />} />
          <Route path="chat" element={<ClinicaChat />} />
          <Route path="*" element={<Navigate to="/clinica" replace />} />
        </Route>

        {/* Demais telas do fluxo público */}
        <Route element={<MainLayout />}>
          <Route path="/styleguide" element={<Styleguide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
