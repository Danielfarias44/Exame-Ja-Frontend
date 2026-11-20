import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const LayoutPublico = lazy(() => import("@/layouts/LayoutPublico"));
const PaginaInicial = lazy(() => import("@/pages/paciente_deslogado/PaginaInicial"));
const PaginaCadastro = lazy(() => import("@/pages/paciente_deslogado/PaginaCadastro"));
const PaginaLogin = lazy(() => import("@/pages/paciente_deslogado/PaginaLogin"));
const RecuperacaoAcesso = lazy(() => import("@/pages/paciente_deslogado/RecuperacaoAcesso"));

const SearchResults = lazy(() => import("@/pages/paciente_deslogado/SearchResults"));
const EstablishmentDetails = lazy(() => import("@/pages/paciente_deslogado/EstablishmentDetails"));
const Compare = lazy(() => import("@/pages/paciente_deslogado/Compare"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Área pública e autenticação com cabeçalho fixo e tema sincronizado */}
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/recuperar-acesso" element={<RecuperacaoAcesso />} />
        </Route>

        {/* Demais telas do fluxo */}
        <Route element={<MainLayout />}>
          <Route path="/busca" element={<SearchResults />} />
          <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/styleguide" element={<Styleguide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}