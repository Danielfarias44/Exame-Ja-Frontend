import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchEstablishments } from "../../services/api";
import EstablishmentCard from "../../components/EstablishmentCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [establishments, setEstablishments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [sortBy, setSortBy] = useState("rating");
  const [filters, setFilters] = useState({ price: "", insurance: "", specialty: "" });

  useEffect(() => {
    setStatus("loading");
    searchEstablishments({ q: query, ...filters })
      .then((data) => {
        setEstablishments(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [query, filters]);

  const sorted = [...establishments].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    return b.rating - a.rating;
  });

  return (
    <section>
      <h1 style={{color: "black"}}>Resultados para “{query}”</h1>

      <div aria-label="Filtros" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <select
          value={filters.specialty}
          onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
        >
          <option value="">Especialidade</option>
          <option value="imagem">Imagem</option>
          <option value="analises">Análises clínicas</option>
        </select>

        <select
          value={filters.insurance}
          onChange={(e) => setFilters((f) => ({ ...f, insurance: e.target.value }))}
        >
          <option value="">Convênio</option>
          <option value="unimed">Unimed</option>
          <option value="hapvida">Hapvida</option>
          <option value="sus">SUS</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="rating">Melhor avaliados</option>
          <option value="price">Menor preço</option>
        </select>
      </div>

      {status === "loading" && <p>Carregando resultados...</p>}
      {status === "error" && <p role="alert">Não foi possível carregar os resultados. Tente novamente.</p>}
      {status === "success" && sorted.length === 0 && <p>Nenhum resultado encontrado.</p>}

      {status === "success" && (
        <div style={{ display: "grid", gap: "1rem", color: 'black'}}>
          {sorted.map((establishment) => (
            <EstablishmentCard key={establishment.id} establishment={establishment} />
          ))}
        </div>
      )}
    </section>
  );
}
