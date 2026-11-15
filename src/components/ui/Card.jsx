import { Box } from "@chakra-ui/react";
// Box do Chakra agora é Card (geralmente utilizado para os cards de estabelecimento)
export default function Card({ children, ...props }) {
  return (
    <Box
      as="article"
      bg="var(--color-surface)"
      borderRadius="var(--radius-lg)"
      boxShadow="var(--shadow-md)"
      p="var(--space-4)"
      {...props}
    >
      {children}
    </Box>
  );
}
