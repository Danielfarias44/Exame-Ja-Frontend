import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Container, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import InsuranceBadges from "@/components/establishment/InsuranceBadges";
import RatingSummary from "@/components/establishment/RatingSummary";
import { getClinicsMap, getInsurances } from "@/services/api";
import { ehPaciente } from "@/services/autenticacaoService";
import { useSessao } from "@/hooks/useSessao";

const RAIOS = [10, 20, 30, 50].map((km) => ({ value: String(km), label: `Até ${km} km` }));
const RAIO_PADRAO = "30";

function formatarDistancia(km) {
  return km.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export default function MapaClinicas() {
  const sessao = useSessao();
  const prefixo = ehPaciente(sessao) ? "/paciente" : "";
  const [convenios, setConvenios] = useState([]);
  const [convenioId, setConvenioId] = useState("");
  const [raioKm, setRaioKm] = useState(RAIO_PADRAO);
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({ status: "loading", dados: null, erro: "", chave: "" });
  const chave = `${convenioId}|${raioKm}|${tentativa}`;

  useEffect(() => {
    let ativo = true;
    getInsurances()
      .then((lista) => { if (ativo) setConvenios(lista); })
      .catch(() => { if (ativo) setConvenios([]); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    getClinicsMap({ convenioId, raioKm })
      .then((dados) => { if (ativo) setEstado({ status: "ready", dados, erro: "", chave }); })
      .catch((falha) => { if (ativo) setEstado({ status: "error", dados: null, erro: falha.message || "Não foi possível carregar o mapa.", chave }); });
    return () => { ativo = false; };
  }, [convenioId, raioKm, chave]);

  const carregando = estado.chave !== chave;
  const dados = estado.dados;
  const clinicas = dados?.clinics ?? [];
  const nomeCentro = dados?.center?.nome || "ponto escolhido";
  const rotaDetalhes = (clinica) => `${prefixo}/estabelecimento/${encodeURIComponent(clinica.id)}`;

  function limparFiltros() {
    setConvenioId("");
    setRaioKm(RAIO_PADRAO);
  }

  return (
    <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py={{ base: "var(--space-6)", md: "var(--space-8)" }}>
      <PageHeader
        title="Clínicas no mapa"
        description="Todas as clínicas aprovadas no Exame Já em Belém e região. Toque num marcador para ver o endereço."
        actions={<Button asChild variant="outline"><Link to={prefixo || "/busca"}>Buscar por exame</Link></Button>}
      />

      <Stack gap="var(--space-6)">
        <Flex as="fieldset" gap="var(--space-4)" wrap="wrap" border="none" p={0} m={0}>
          <legend className="sr-only">Filtrar clínicas do mapa</legend>
          <Box flex="1" minW="var(--width-field-min)" maxW="var(--width-field)">
            <Select
              label="Convênio"
              placeholder="Todos os convênios"
              options={convenios.map((convenio) => ({ value: convenio.id, label: convenio.name }))}
              value={convenioId}
              onChange={(evento) => setConvenioId(evento.target.value)}
            />
          </Box>
          <Box flex="1" minW="var(--width-field-min)" maxW="var(--width-field)">
            <Select
              label={`Distância a partir de ${nomeCentro}`}
              options={RAIOS}
              value={raioKm}
              onChange={(evento) => setRaioKm(evento.target.value)}
            />
          </Box>
        </Flex>

        {estado.status === "error" && !carregando ? (
          <ErrorState title="Mapa indisponível" description={estado.erro} onRetry={() => setTentativa((atual) => atual + 1)} />
        ) : carregando ? (
          <ListSkeleton count={3} />
        ) : (
          <>
            <Text role="status" fontSize="var(--text-sm)" color="var(--color-text-muted)">
              {clinicas.length === 1 ? "1 clínica" : `${clinicas.length} clínicas`} a até {dados.radiusKm} km de {nomeCentro}.
              {dados.withoutCoordinates > 0 && ` ${dados.withoutCoordinates === 1 ? "1 clínica ainda não tem" : `${dados.withoutCoordinates} clínicas ainda não têm`} endereço localizado e não aparece${dados.withoutCoordinates === 1 ? "" : "m"} no mapa.`}
            </Text>

            <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }} gap="var(--space-6)" alignItems="start">
              <Box position={{ lg: "sticky" }} top={{ lg: "var(--space-6)" }}>
                {dados.center && (
                  <EstablishmentMap
                    establishments={clinicas}
                    center={dados.center}
                    zoom={12}
                    altura="var(--map-height-lg)"
                    rotuloCentro={`Centro: ${nomeCentro}`}
                    rotaDetalhes={rotaDetalhes}
                    label="Mapa das clínicas aprovadas"
                  />
                )}
              </Box>

              {clinicas.length === 0 ? (
                <EmptyState
                  title="Nenhuma clínica com esses filtros"
                  description="Tente outro convênio ou aumente a distância."
                  action={<Button variant="outline" onClick={limparFiltros}>Mostrar todas</Button>}
                />
              ) : (
                <Stack as="ul" aria-label="Clínicas no mapa" listStyle="none" p={0} m={0} gap="var(--space-3)">
                  {clinicas.map((clinica) => (
                    <Box as="li" key={clinica.id}>
                      <Card as="article" p="var(--space-4)">
                        <Stack gap="var(--space-2)">
                          <Text as="h2" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-base)" color="var(--color-text)">
                            {clinica.name}
                          </Text>
                          <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">
                            {clinica.address}
                            {Number.isFinite(clinica.distanceKm) && ` · a ${formatarDistancia(clinica.distanceKm)} km`}
                          </Text>
                          <RatingSummary rating={clinica.rating} reviewsCount={clinica.reviewsCount} />
                          <InsuranceBadges insurances={clinica.insurances} />
                          <Box>
                            <Button asChild variant="outline">
                              <Link to={rotaDetalhes(clinica)} aria-label={`Ver clínica: ${clinica.name}`}>Ver clínica</Link>
                            </Button>
                          </Box>
                        </Stack>
                      </Card>
                    </Box>
                  ))}
                </Stack>
              )}
            </Grid>
          </>
        )}
      </Stack>
    </Container>
  );
}
