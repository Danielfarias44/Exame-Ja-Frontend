import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchEstablishments } from "../../services/api";
import EstablishmentCard from "../../components/establishment/EstablishmentCard";
import SearchFilters from "@/components/establishment/SearchFilters";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const exame = searchParams.get("exame") ?? "";
  const convenio = searchParams.get("convenio") ?? "";
  const raio = searchParams.get("raio") ?? "";
  const ordenar = searchParams.get("ordenar") ?? "";

  const [establishments, setEstablishments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  

  useEffect(() => {
    setStatus("loading");
    searchEstablishments({exame, convenio, raio, ordenar})
      .then((data) => {
        setEstablishments(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [exame, convenio, raio, ordenar]);

  const sorted = [...establishments].sort((a, b) => {
    if (ordenar === 'preco') return a.price - b.price;
    return b.rating - a.rating;
  });

  return (
    <section>
      <SearchFilters key={searchParams.toString()}/>
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
