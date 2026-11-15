import { Box, Text } from "@chakra-ui/react";
// Tag de Preço
export const PRICE_LABEL = "Preço de exemplo";

export default function PriceTag({ price, label = PRICE_LABEL }) {
  const hasPrice = typeof price === "number";

  return (
    <Box>
      <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">
        {label}
      </Text>
      {hasPrice ? (
        <Text fontSize="var(--text-xl)" fontWeight="var(--weight-bold)">
          {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </Text>
      ) : (
        <Text color="var(--color-text-muted)" fontSize="var(--text-sm)">
          Preço não informado
        </Text>
      )}
    </Box>
  );
}
