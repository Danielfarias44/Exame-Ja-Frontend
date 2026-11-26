import { Box } from "@chakra-ui/react";

export const ID_CONTEUDO = "conteudo";

export default function PularParaConteudo() {
  return (
    <Box
      as="a"
      href={`#${ID_CONTEUDO}`}
      position="absolute"
      left="var(--space-2)"
      top="var(--space-2)"
      zIndex="var(--z-toast)"
      px="var(--space-4)"
      py="var(--space-3)"
      bg="var(--color-surface)"
      color="var(--color-primary)"
      fontFamily="var(--font-heading)"
      fontWeight="var(--weight-bold)"
      borderWidth="var(--border-width-strong)"
      borderStyle="solid"
      borderColor="var(--color-focus)"
      borderRadius="var(--radius-md)"
      transform="translateY(-200%)"
      _focus={{ transform: "translateY(0)" }}
    >
      Pular para o conteúdo
    </Box>
  );
}
