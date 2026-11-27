import { Box, Flex, Text } from "@chakra-ui/react";

export default function FeedbackErro({ mensagem, titulo = "Não foi possível concluir" }) {
  if (!mensagem) return null;

  return (
    <Flex
      role="alert"
      aria-live="assertive"
      align="flex-start"
      gap="var(--space-3)"
      p="var(--space-4)"
      bg="var(--color-error-soft)"
      border="var(--border-width) solid var(--color-error)"
      borderRadius="var(--radius-md)"
      color="var(--color-text)"
    >
      <Flex
        aria-hidden="true"
        align="center"
        justify="center"
        flexShrink={0}
        boxSize="var(--icon-sm)"
        borderRadius="var(--radius-full)"
        bg="var(--color-error)"
        color="var(--color-text-on-primary)"
        fontWeight="var(--weight-bold)"
        fontSize="var(--text-sm)"
      >
        !
      </Flex>
      <Box minW={0}>
        <Text fontWeight="var(--weight-bold)" fontSize="var(--text-sm)" color="var(--color-error)">{titulo}</Text>
        <Text mt="var(--space-1)" fontSize="var(--text-sm)" lineHeight="var(--leading-normal)">{mensagem}</Text>
      </Box>
    </Flex>
  );
}
