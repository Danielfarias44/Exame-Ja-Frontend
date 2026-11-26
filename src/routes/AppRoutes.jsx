import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
const Agendamento = lazy(() => import("@/pages/paciente_logado/Agendamento"));
const MeusAgendamentos = lazy(() => import("@/pages/paciente_logado/MeusAgendamentos"));
const Historico = lazy(() => import("@/pages/paciente_logado/Historico"));
const Avaliacao = lazy(() => import("@/pages/paciente_logado/Avaliacao"));
const ClinicaDashboard = lazy(() => import("@/pages/clinica/ClinicaDashboard"));
const ClinicaChat = lazy(() => import("@/pages/clinica/ClinicaChat"));
const LayoutPainel = lazy(() => import("@/layouts/LayoutPainel"));
const AdminClinicas = lazy(() => import("@/pages/admin/AdminClinicas"));
const AdminEstabelecimentos = lazy(() => import("@/pages/admin/AdminEstabelecimentos"));
const AdminUsuarios = lazy(() => import("@/pages/admin/AdminUsuarios"));
const AdminDenuncias = lazy(() => import("@/pages/admin/AdminDenuncias"));

const MODO_TESTE = import.meta.env.VITE_MODO_TESTE === "true";

const LINKS_ADMIN = [
  { rota: "/admin", rotulo: "Fila de aprovação", exato: true },
  { rota: "/admin/clinicas", rotulo: "Clínicas" },
  { rota: "/admin/usuarios", rotulo: "Usuários" },
  { rota: "/admin/denuncias", rotulo: "Denúncias" },
];

const LINKS_CLINICA = [
  { rota: "/clinica", rotulo: "Painel", exato: true },
  { rota: "/clinica/chat", rotulo: "Conversas" },
];
const TesteCadastro = lazy(() => import("@/pages/teste/TesteCadastro"));
const TesteLogin = lazy(() => import("@/pages/teste/TesteLogin"));
const TesteAdmin = lazy(() => import("@/pages/teste/TesteAdmin"));

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
          {MODO_TESTE && (
            <>
              <Route path="/teste" element={<Navigate to="/teste/cadastro" replace />} />
              <Route path="/teste/cadastro" element={<TesteCadastro />} />
              <Route path="/teste/admin" element={<TesteAdmin />} />
              <Route path="/teste/login" element={<TesteLogin />} />
            </>
          )}
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
          <Route path="comparar" element={<Navigate to="/busca" replace />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="agendar" element={<Agendamento />} />
          <Route path="agendamentos" element={<MeusAgendamentos />} />
          <Route path="historico" element={<Historico />} />
          <Route path="avaliacao" element={<Avaliacao />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="chat" element={<Chat />} />
          <Route path="mapa" element={<Navigate to="/busca" replace />} />
          <Route path="estabelecimento/:id" element={<EstablishmentDetails />} />
          <Route path="*" element={<Navigate to="/paciente" replace />} />
        </Route>

        <Route path="/admin" element={<RotaProtegida perfilPermitido={PERFIS.ADMIN}><LayoutPainel rotaInicio="/admin" nomeArea="Administração" links={LINKS_ADMIN} /></RotaProtegida>}>
          <Route index element={<AdminClinicas />} />
          <Route path="clinicas" element={<AdminEstabelecimentos />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="denuncias" element={<AdminDenuncias />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route
          path="/clinica"
          element={
            <RotaProtegida perfilPermitido={PERFIS.CLINICA}>
              <LayoutPainel rotaInicio="/clinica" nomeArea="Área da clínica" links={LINKS_CLINICA} />
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
