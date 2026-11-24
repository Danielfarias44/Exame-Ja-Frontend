import { Box } from "@chakra-ui/react";
// Box do Chakra agora é Card (geralmente utilizado para os cards de estabelecimento)
export default function Card({ children, ...props }) {
  return (
    <Box
      as="article"
      bg="var(--color-surface)"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-border-soft)"
      borderRadius="var(--radius-lg)"
      boxShadow="var(--shadow-sm)"
      p={{ base: "var(--space-4)", md: "var(--space-6)" }}
      {...props}
    >
      {children}
    </Box>
  );
}
