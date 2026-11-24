import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Grid, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { getInsurances, searchExamOffers } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import SearchBar from "@/components/establishment/SearchBar";
import EstablishmentCard from "@/components/establishment/EstablishmentCard";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import OfferActions from "@/components/establishment/OfferActions";
import LoginPrompt from "@/components/LoginPrompt";

const ORDENACOES = ["distancia", "preco", "avaliacao"];
const opcoesOrdenar = [
  { value: "distancia", label: "Mais perto" },
  { value: "preco", label: "Menor preço" },
  { value: "avaliacao", label: "Melhor avaliação" },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const convenio = searchParams.get("convenio") ?? "";
  const ordenarDaUrl = searchParams.get("ordenar");
  const ordenar = ORDENACOES.includes(ordenarDaUrl) ? ordenarDaUrl : "distancia";

  const [ofertas, setOfertas] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [status, setStatus] = useState("loading");
  const estaLogado = Boolean(obterSessaoAtual()?.token);

  useEffect(() => {
    getInsurances().then(setConvenios);
  }, []);

  useEffect(() => {
    setStatus("loading");
    searchExamOffers({ q, convenio, ordenar })
      .then((resultado) => {
        setOfertas(resultado);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [q, convenio, ordenar]);

  const clinicasNoMapa = useMemo(() => {
    const porClinica = new Map();
    ofertas.forEach((oferta) => {
      if (!porClinica.has(oferta.clinicId)) {
        porClinica.set(oferta.clinicId, { ...oferta, id: oferta.clinicId });
      }
    });
    return [...porClinica.values()];
  }, [ofertas]);

  function atualizarBusca(mudancas) {
    const proximos = new URLSearchParams(searchParams);
    Object.entries(mudancas).forEach(([chave, valor]) => {
      if (valor) proximos.set(chave, valor);
      else proximos.delete(chave);
    });
    setSearchParams(proximos);
  }

  let mensagemContagem = "";
  if (status === "loading") {
    mensagemContagem = "Buscando exames...";
  } else if (status === "success" && ofertas.length === 1) {
    mensagemContagem = "1 opção encontrada";
  } else if (status === "success" && ofertas.length > 1) {
    mensagemContagem = ofertas.length + " opções encontradas";
  }

  return (
    <Container
      maxW="var(--container-max)"
      px={{ base: "var(--space-4)", md: "var(--space-6)" }}
      py={{ base: "var(--space-6)", md: "var(--space-8)" }}
    >
      <PageHeader
        title={q ? `Resultados para “${q}”` : "Buscar exames"}
        description="Compare preço, distância e convênios das clínicas parceiras em Belém."
      />

      <Stack gap="var(--space-6)">
        <Stack gap="var(--space-4)">
          <SearchBar key={q} defaultValue={q} onSearch={(termo) => atualizarBusca({ q: termo })} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)" maxW="40rem">
            <Select
              name="convenio"
              label="Convênio"
              placeholder="Qualquer convênio"
              options={convenios.map((item) => ({ value: item.id, label: item.name }))}
              value={convenio}
              onChange={(event) => atualizarBusca({ convenio: event.target.value })}
            />
            <Select
              name="ordenar"
              label="Prioridade"
              options={opcoesOrdenar}
              value={ordenar}
              onChange={(event) => atualizarBusca({ ordenar: event.target.value })}
            />
          </SimpleGrid>
        </Stack>

        {!estaLogado && <LoginPrompt action="agendar ou conversar com uma clínica" />}

        <Text aria-live="polite" color="var(--color-text-muted)" fontSize="var(--text-sm)">
          {mensagemContagem}
        </Text>

        {status === "loading" && <ListSkeleton />}
        {status === "error" && <ErrorState />}
        {status === "success" && ofertas.length === 0 && (
          <EmptyState description="Tente outro nome de exame, clínica ou convênio, ou tire o filtro de convênio." />
        )}

        {status === "success" && ofertas.length > 0 && (
          <Grid
            templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }}
            gap="var(--space-6)"
            alignItems="start"
          >
            <Stack gap="var(--space-4)" gridColumn={{ lg: "2" }} gridRow={{ lg: "1" }}>
              <EstablishmentMap
                establishments={clinicasNoMapa}
                zoom={13}
                label="Mapa das clínicas encontradas"
              />
            </Stack>
            <Stack
              as="ul"
              role="list"
              gap="var(--space-4)"
              m={0}
              p={0}
              listStyleType="none"
              gridColumn={{ lg: "1" }}
              gridRow={{ lg: "1" }}
            >
              {ofertas.map((oferta) => (
                <li key={oferta.id}>
                  <EstablishmentCard
                    establishment={oferta}
                    actions={<OfferActions oferta={oferta} estaLogado={estaLogado} />}
                  />
                </li>
              ))}
            </Stack>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
