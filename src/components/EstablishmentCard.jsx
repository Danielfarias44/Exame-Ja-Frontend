import { Link } from "react-router-dom";
import { Flex, Heading, Text } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RatingSummary from "@/components/RatingSummary";
import PriceTag from "@/components/PriceTag";
import InsuranceBadges from "@/components/InsuranceBadges";
// Cartão do estabelecimento
function formatDistance(km) {
  return km.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export default function EstablishmentCard({ establishment }) {
  const { id, name, address, price, rating, reviewsCount, insurances, distanceKm, exam } =
    establishment;

  return (
    <Card>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        gap="var(--space-4)"
      >
        <Flex direction="column" gap="var(--space-2)" minW={0}>
          <Heading as="h3" fontFamily="var(--font-heading)" fontSize="var(--text-lg)">
            {name}
          </Heading>
          <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">
            {address}
            {distanceKm != null && ` · a ${formatDistance(distanceKm)} km`}
          </Text>
          {exam && <Text fontSize="var(--text-sm)">Exame: {exam}</Text>}
          <RatingSummary rating={rating} reviewsCount={reviewsCount} />
          <InsuranceBadges insurances={insurances} />
        </Flex>

        <Flex
          direction="column"
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          gap="var(--space-3)"
        >
          <PriceTag price={price} />
          <Button asChild>
            <Link to={`/estabelecimento/${id}`} aria-label={`Ver detalhes de ${name}`}>
              Ver detalhes
            </Link>
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}