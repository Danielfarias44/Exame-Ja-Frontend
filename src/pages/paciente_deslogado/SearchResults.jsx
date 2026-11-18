import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchEstablishments } from "@/services/api";
import { Stack, Heading, Text } from "@chakra-ui/react";
import EstablishmentCard from "@/components/establishment/EstablishmentCard";
import SearchFilters from "@/components/establishment/SearchFilters";
import EmptyState from "@/components/ui/EmptyState";
import ListSkeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { getExame } from "@/services/mocksExames";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const exame = searchParams.get("exame") ?? "";
  const convenio = searchParams.get("convenio") ?? "";
  const raio = searchParams.get("raio") ?? "";
  const ordenar = searchParams.get("ordenar") ?? "";
  const nomeDoExame = getExame(exame)?.nome;

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

  let mensagemContagem = '';
  if (status === "loading") {
    mensagemContagem = "Buscando clínicas...";
  } else if (status === "success" && sorted.length === 1) {
    mensagemContagem = "1 clínica encontrada";
  } else if (status === "success" && sorted.length > 1) {
    mensagemContagem = sorted.length + " clínicas encontradas";
  }

  if (!exame){
    return (
      <Stack gap="var(--space-6)" as='section'>
        <Heading as="h1" fontSize="var(--text-2xl)">Pesquise um exame</Heading>
        <SearchFilters key={searchParams.toString()}/>
        <EmptyState title="Comece escolhendo um exame" description='Use os filtros para achar a melhor clínica para você'/>
      </Stack>
    );
  }
  return (
    <Stack gap="var(--space-6)" as='section'>
      <Heading as="h1" fontSize="var(--text-2xl)">Resultados para {nomeDoExame ?? "o exame escolhido"}  </Heading>
      <SearchFilters key={searchParams.toString()}/>
      <Text aria-live="polite" color="var(--color-text-muted)" fontSize="var(--text-sm)">{mensagemContagem}</Text>
      {status === "loading" && <ListSkeleton/>}
      {status === "error" && <ErrorState/>}
      {status === "success" && sorted.length === 0 && <EmptyState description='Tente aumentar a distância ou escolher outro convênio'/>}
      {status === "success" && sorted.length > 0 && (
        <Stack gap="var(--space-4)">
          {sorted.map((establishment) => (
            <EstablishmentCard key={establishment.id} establishment={establishment} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
