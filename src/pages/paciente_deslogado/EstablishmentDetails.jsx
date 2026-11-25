import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { getEstablishment, getClinicReviews } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import PriceTag from "@/components/establishment/PriceTag";
import RatingSummary from "@/components/establishment/RatingSummary";
import InsuranceBadges from "@/components/establishment/InsuranceBadges";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import LoginPrompt from "@/components/LoginPrompt";
import Button from "@/components/ui/Button";

export default function EstablishmentDetails() {
  const { id } = useParams();
  const [ofertas, setOfertas] = useState([]);
  const [clinica, setClinica] = useState(null);
  const [recursoCarregado, setRecursoCarregado] = useState(null);
  const [recursoAvaliacoes, setRecursoAvaliacoes] = useState(null);
  const [tentativaAvaliacoes, setTentativaAvaliacoes] = useState(0);
  const status = recursoCarregado?.id === id ? recursoCarregado.status : "loading";
  const estadoAvaliacoes = recursoAvaliacoes?.id === id ? recursoAvaliacoes : { status: "loading", avaliacoes: [] };
  const estaLogado = Boolean(obterSessaoAtual()?.autenticado);

  useEffect(() => {
    let ativo = true;
    getEstablishment(id)
      .then((detalhes) => {
        if (!ativo) return;
        if (!detalhes) {
          setRecursoCarregado({ id, status: "missing" });
          return;
        }
        setClinica(detalhes.clinic);
        setOfertas(detalhes.offers ?? []);
        setRecursoCarregado({ id, status: "success" });
      })
      .catch((falha) => {
        if (!ativo) return;
        setRecursoCarregado({ id, status: "error", erro: falha.message });
      });
    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    let ativo = true;
    getClinicReviews(id)
      .then((resultado) => {
        if (!ativo) return;
        setRecursoAvaliacoes({ id, status: "success", avaliacoes: resultado.avaliacoes ?? [] });
      })
      .catch((falha) => {
        if (!ativo) return;
        setRecursoAvaliacoes({ id, status: "error", erro: falha.message || "Não foi possível carregar as avaliações." });
      });
    return () => { ativo = false; };
  }, [id, tentativaAvaliacoes]);

  if (status === "loading") return <ListSkeleton count={2} />;
  if (status !== "success") {
    return <ErrorState title="Detalhes indisponíveis" description={recursoCarregado?.erro || "A clínica não foi encontrada ou não está disponível."} />;
  }

  return (
    <Stack gap="var(--space-8)">
      <PageHeader title={clinica.nomeFantasia} description={clinica.endereco} />
      {!estaLogado && <LoginPrompt action="conversar com esta clínica" />}
      <Card>
        <Stack gap="var(--space-3)">
          {clinica.telefone && <Text>Telefone: {clinica.telefone}</Text>}
          <RatingSummary rating={clinica.avaliacaoMedia || null} reviewsCount={clinica.quantidadeAvaliacoes} />
          <Text color="var(--color-text-muted)" fontSize="var(--text-sm)">
            {Number.isFinite(ofertas[0]?.distanceKm) ? `${ofertas[0].distanceKm.toLocaleString("pt-BR")} km de distância` : "Distância não informada"}
          </Text>
          <InsuranceBadges insurances={(clinica.conveniosAceitos ?? []).map(({ nome }) => nome)} maxVisible={6} />
        </Stack>
      </Card>
      <Stack as="section" gap="var(--space-4)" aria-labelledby="titulo-localizacao">
        <SectionTitle id="titulo-localizacao">Localização</SectionTitle>
        {Number.isFinite(clinica.latitude) && Number.isFinite(clinica.longitude)
          ? <EstablishmentMap establishments={[{ name: clinica.nomeFantasia, address: clinica.endereco, lat: clinica.latitude, lng: clinica.longitude, id }]} zoom={16} label={`Mapa com a localização de ${clinica.nomeFantasia}`} />
          : <Text color="var(--color-text-muted)">A localização da unidade não está disponível no mapa.</Text>}
      </Stack>
      <Stack as="section" gap="var(--space-4)" aria-labelledby="titulo-ofertas">
        <SectionTitle id="titulo-ofertas">Ofertas encontradas</SectionTitle>
        {ofertas.map((oferta) => (
          <Card key={oferta.id}>
            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap="var(--space-4)">
              <Stack gap="var(--space-1)">
                <Text as="strong" fontWeight="var(--weight-bold)">{oferta.exam}</Text>
                <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Código TUSS: {oferta.examCode}</Text>
                <PriceTag price={oferta.price} label="Preço informado pela clínica" />
              </Stack>
                {estaLogado && <Flex gap="var(--space-2)" wrap="wrap"><Button asChild><Link to={`/paciente/agendar?clinicaId=${encodeURIComponent(oferta.clinicId)}&codigoExame=${encodeURIComponent(oferta.examCode)}&nomeExame=${encodeURIComponent(oferta.exam)}`}>Solicitar horário</Link></Button><Button asChild variant="outline"><Link to={`/paciente/chat?clinicaId=${encodeURIComponent(oferta.clinicId)}`}>Conversar com a clínica</Link></Button></Flex>}
            </Flex>
          </Card>
        ))}
      </Stack>
      <Stack as="section" gap="var(--space-3)" aria-labelledby="titulo-avaliacoes">
        <SectionTitle id="titulo-avaliacoes">Avaliações</SectionTitle>
        {estadoAvaliacoes.status === "loading" && <Text color="var(--color-text-muted)" fontSize="var(--text-sm)">Carregando avaliações...</Text>}
        {estadoAvaliacoes.status === "error" && <ErrorState title="Não foi possível carregar as avaliações" description={estadoAvaliacoes.erro} onRetry={() => { setRecursoAvaliacoes({ id, status: "loading", avaliacoes: [] }); setTentativaAvaliacoes((atual) => atual + 1); }} />}
        {estadoAvaliacoes.status === "success" && estadoAvaliacoes.avaliacoes.length === 0
          ? <Text color="var(--color-text-muted)" fontSize="var(--text-sm)">Esta clínica ainda não recebeu avaliações.</Text>
          : estadoAvaliacoes.status === "success" && estadoAvaliacoes.avaliacoes.map((avaliacao) => <Card key={avaliacao.id}><Stack gap="var(--space-2)"><RatingSummary rating={avaliacao.nota} reviewsCount={1} />{avaliacao.comentario && <Text>{avaliacao.comentario}</Text>}</Stack></Card>)}
      </Stack>
    </Stack>
  );
}
