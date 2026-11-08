import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/paciente_deslogado/Home";
import SearchResults from "@/pages/paciente_deslogado/SearchResults";
import EstablishmentDetails from "@/pages/paciente_deslogado/EstablishmentDetails";
import Compare from "@/pages/paciente_deslogado/Compare";
import TelaDeCadastro from "@/pages/paciente_deslogado/TelaDeCadastro.jsx";
import TelaDeLogin from "@/pages/paciente_deslogado/TelaDeLogin.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
        <Route path="/comparar" element={<Compare />} />
        <Route path="/cadastro" element={<TelaDeCadastro />} />
        <Route path="/login" element={<TelaDeLogin />} />
      </Route>
    </Routes>
  );
}
