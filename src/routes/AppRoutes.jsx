import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const LayoutPublico = lazy(() => import("@/layouts/LayoutPublico"));
const PaginaInicial = lazy(() => import("@/pages/paciente_deslogado/PaginaInicial"));
const SearchResults = lazy(() => import("@/pages/paciente_deslogado/SearchResults"));
const EstablishmentDetails = lazy(() => import("@/pages/paciente_deslogado/EstablishmentDetails"));
const Compare = lazy(() => import("@/pages/paciente_deslogado/Compare"));
const TelaDeCadastro = lazy(() => import("@/pages/paciente_deslogado/PaginaCadastro.jsx"));
const TelaDeLogin = lazy(() => import("@/pages/paciente_deslogado/PaginaLogin.jsx"));
const Styleguide = lazy(() => import("@/pages/Styleguide.jsx"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<PaginaInicial />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/busca" element={<SearchResults />} />
          <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/cadastro" element={<TelaDeCadastro />} />
          <Route path="/login" element={<TelaDeLogin />} />
          <Route path="/styleguide" element={<Styleguide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}