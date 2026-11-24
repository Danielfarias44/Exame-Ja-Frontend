import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { getEstablishment, getEstablishmentReviews } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ListSkeleton from "@/components/ui/Skeleton";
import PriceTag from "@/components/establishment/PriceTag";
import RatingSummary from "@/components/establishment/RatingSummary";
import InsuranceBadges from "@/components/establishment/InsuranceBadges";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import LoginPrompt from "@/components/LoginPrompt";

export default function EstablishmentDetails() {
  const { id } = useParams();
  const [establishment, setEstablishment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const estaLogado = Boolean(obterSessaoAtual()?.token);

  useEffect(() => {
    setStatus("loading");
    Promise.all([getEstablishment(id), getEstablishmentReviews(id)])
      .then(([establishmentData, reviewsData]) => {
        setEstablishment(establishmentData);
        setReviews(reviewsData);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <ListSkeleton count={2} />;

  if (status === "error" || !establishment) {
    return (
      <ErrorState
        title="Estabelecimento não encontrado"
        description="Confira o endereço da página ou volte para a busca."
      />
    );
  }

  const temCoordenadas = establishment.lat != null && establishment.lng != null;

  return (
    <Stack gap="var(--space-8)">
      <PageHeader title={establishment.name} description={establishment.address} />

      <Card>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap="var(--space-4)"
        >
          <Stack gap="var(--space-3)">
            <RatingSummary rating={establishment.rating} reviewsCount={establishment.reviewsCount} />
            <InsuranceBadges insurances={establishment.insurances} maxVisible={6} />
          </Stack>
          <PriceTag price={establishment.price} />
        </Flex>
      </Card>

      {!estaLogado && <LoginPrompt action="agendar um exame nesta clínica" />}

      <Stack as="section" gap="var(--space-4)" aria-labelledby="titulo-localizacao">
        <SectionTitle id="titulo-localizacao">Localização</SectionTitle>
        {temCoordenadas ? (
          <EstablishmentMap
            establishments={[establishment]}
            zoom={16}
            label={`Mapa com a localização de ${establishment.name}`}
          />
        ) : (
          <EmptyState
            title="Localização indisponível"
            description="Esta clínica ainda não informou a localização no mapa. Use o endereço acima."
          />
        )}
      </Stack>

      <Stack as="section" gap="var(--space-4)" aria-labelledby="titulo-avaliacoes">
        <SectionTitle id="titulo-avaliacoes">Avaliações</SectionTitle>
        {reviews.length === 0 ? (
          <EmptyState title="Ainda sem avaliações" />
        ) : (
          <Stack as="ul" role="list" gap="var(--space-3)" m={0} p={0} listStyleType="none">
            {reviews.map((review) => (
              <Card as="li" key={review.id}>
                <Stack gap="var(--space-2)">
                  <Flex align="center" gap="var(--space-2)">
                    <Text as="strong" fontWeight="var(--weight-bold)">
                      {review.author}
                    </Text>
                    <Flex align="center" gap="var(--space-1)" color="var(--color-text-muted)">
                      <FaStar aria-hidden="true" color="var(--color-accent)" />
                      <Text as="span" fontSize="var(--text-sm)">
                        {review.rating} de 5
                      </Text>
                    </Flex>
                  </Flex>
                  <Text fontSize="var(--text-sm)" color="var(--color-text)">
                    {review.comment}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
