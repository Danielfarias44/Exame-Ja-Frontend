import { Flex, Text } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
// Mostra o resumo de avaliação do estabelecimento
export default function RatingSummary({ rating, reviewsCount = 0 }) {
  if (rating == null || reviewsCount === 0) {
    return (
      <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">
        Ainda sem avaliações
      </Text>
    );
  }

  const nota = rating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <Flex align="center" gap="var(--space-1)" fontSize="var(--text-sm)">
      <FaStar aria-hidden="true" color="var(--color-accent)" />
      <Text as="span" fontWeight="var(--weight-bold)">
        {nota}
      </Text>
      <Text as="span" color="var(--color-text-muted)">
        ({reviewsCount} {reviewsCount === 1 ? "avaliação" : "avaliações"})
      </Text>
    </Flex>
  );
}
