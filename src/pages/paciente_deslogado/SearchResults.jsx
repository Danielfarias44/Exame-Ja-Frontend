import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchEstablishments } from "../../services/api";
import { Stack } from "@chakra-ui/react";
import EstablishmentCard from "../../components/establishment/EstablishmentCard";
import SearchFilters from "@/components/establishment/SearchFilters";
import EmptyState from "@/components/ui/EmptyState";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const exame = searchParams.get("exame") ?? "";
  const convenio = searchParams.get("convenio") ?? "";
  const raio = searchParams.get("raio") ?? "";
  const ordenar = searchParams.get("ordenar") ?? "";

  const [establishments, setEstablishments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  

  useEffect(() => {
    if (!exame){ return }
    setStatus("loading");
    searchEstablishments({exame, convenio, raio, ordenar})
      .then((data) => {
        setEstablishments(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  } , [exame, convenio, raio, ordenar]);


  const sorted = [...establishments].sort((a, b) => {
    let valorA;
    let valorB;
    if (ordenar === 'avaliacao'){
      valorA = a.rating
      valorB = b.rating
    } else if (ordenar === 'preco') {
      valorA = a.price
      valorB = b.price
    } else {
      valorA = a.distanceKm
      valorB = b.distanceKm
    }

    if (valorA == null && valorB == null) {
      return 0;
    }

    if (valorA == null && valorB != null){
      return 1;
    }

    if (valorA != null && valorB == null) {
      return -1;
    }

    if (ordenar === 'avaliacao'){
      return valorB - valorA;
    } else {
      return valorA - valorB;
    }
    
  });

  if (!exame){
    return (
      <Stack gap="var(--space-6)" as='section'>
        <SearchFilters key={searchParams.toString()}/>
        <EmptyState title="Comece escolhendo um exame" description='Use os filtros para achar a melhor clínica para você'/>
      </Stack>
    );
  }

  return (
    <Stack gap="var(--space-6)" as='section'>
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
    </Stack>
  );
}
