import { Box } from "@chakra-ui/react";

export default function ListaDados({ linhas }) {
  const visiveis = linhas.filter(([, valor]) => valor !== undefined && valor !== null && valor !== "");

  return (
    <Box
      as="dl"
      display="grid"
      gridTemplateColumns={{ base: "1fr", sm: "minmax(140px, auto) 1fr" }}
      columnGap="var(--space-4)"
      rowGap="var(--space-1)"
      fontSize="var(--text-sm)"
    >
      {visiveis.map(([termo, valor]) => (
        <Box key={termo} display="contents">
          <Box as="dt" fontWeight="var(--weight-bold)" color="var(--color-text)">{termo}</Box>
          <Box as="dd" color="var(--color-text)" overflowWrap="anywhere" mb={{ base: "var(--space-2)", sm: 0 }}>
            {valor}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
