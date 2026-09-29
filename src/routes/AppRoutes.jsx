import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/patient/Home";
import SearchResults from "../pages/patient/SearchResults";
import EstablishmentDetails from "../pages/patient/EstablishmentDetails";
import Compare from "../pages/patient/Compare";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/estabelecimento/:id" element={<EstablishmentDetails />} />
        <Route path="/comparar" element={<Compare />} />
      </Route>
    </Routes>
  );
}
