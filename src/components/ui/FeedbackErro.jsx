import { Box, Flex, Text } from "@chakra-ui/react";

export default function FeedbackErro({ mensagem, titulo = "Não foi possível concluir" }) {
  if (!mensagem) return null;

  return (
    <Flex
      role="alert"
      aria-live="assertive"
      align="flex-start"
      gap={3}
      p={3.5}
      bg="var(--color-error-soft)"
      border="1px solid var(--color-error)"
      borderRadius="var(--radius-md)"
      color="var(--color-text)"
    >
      <Flex
        aria-hidden="true"
        align="center"
        justify="center"
        flexShrink={0}
        boxSize="24px"
        borderRadius="var(--radius-full)"
        bg="var(--color-error)"
        color="var(--color-text-on-primary)"
        fontWeight="bold"
        fontSize="sm"
      >
        !
      </Flex>
      <Box minW={0}>
        <Text fontWeight="bold" fontSize="sm" color="var(--color-error)">{titulo}</Text>
        <Text mt={0.5} fontSize="sm" lineHeight="var(--leading-normal)">{mensagem}</Text>
      </Box>
    </Flex>
  );
}
