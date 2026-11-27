import { Box, SimpleGrid, Text } from "@chakra-ui/react";

export default function ResumoPainel({ itens }) {
  return (
    <SimpleGrid as="ul" aria-label="Resumo da clínica" listStyle="none" p={0} m={0} columns={{ base: 2, md: 4 }} gap="var(--space-3)">
      {itens.map((item) => (
        <Box as="li" key={item.alvo}>
          <Box
            as="a"
            href={`#${item.alvo}`}
            display="block"
            h="100%"
            p="var(--space-4)"
            bg="var(--color-surface)"
            borderWidth="var(--border-width)"
            borderStyle="solid"
            borderColor={item.destaque ? "var(--color-primary)" : "var(--color-border-soft)"}
            borderRadius="var(--radius-lg)"
            boxShadow="var(--shadow-sm)"
            color="var(--color-text)"
            textDecoration="none"
            transition="border-color var(--duration-fast) var(--ease-standard)"
            _hover={{ borderColor: "var(--color-primary)" }}
          >
            <Text
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-2xl)"
              lineHeight="var(--leading-tight)"
              color={item.destaque ? "var(--color-primary)" : "var(--color-text)"}
            >
              {item.valor}
            </Text>
            <Text mt="var(--space-1)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
              {item.rotulo}
            </Text>
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  );
}
