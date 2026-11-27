import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function SecaoPainel({ id, titulo, descricao, selo, children }) {
  const idTitulo = `${id}-titulo`;

  return (
    <Card as="section" id={id} aria-labelledby={idTitulo} scrollMarginTop="var(--space-6)">
      <Stack gap="var(--space-6)">
        <Box>
          <Flex align="center" gap="var(--space-2)" wrap="wrap">
            <SectionTitle id={idTitulo}>{titulo}</SectionTitle>
            {selo}
          </Flex>
          {descricao && (
            <Text mt="var(--space-1)" fontSize="var(--text-sm)" color="var(--color-text-muted)">
              {descricao}
            </Text>
          )}
        </Box>
        {children}
      </Stack>
    </Card>
  );
}
