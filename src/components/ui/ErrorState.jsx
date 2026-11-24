import { Flex, Heading, Text } from "@chakra-ui/react";
import Button from "./Button";
// Estado para quando algo no sistema dá erro (que surpresa)
export default function ErrorState({
  title = "Não foi possível carregar",
  description = "Verifique sua conexão e tente novamente.",
  onRetry,
}) {
  return (
    <Flex
      role="alert"
      direction="column"
      align="center"
      textAlign="center"
      gap="var(--space-3)"
      py="var(--space-8)"
      px="var(--space-4)"
      bg="var(--color-error-soft)"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-error)"
      borderRadius="var(--radius-lg)"
    >
      <Heading
        as="h2"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-semibold)"
        fontSize="var(--text-lg)"
        color="var(--color-error)"
      >
        {title}
      </Heading>
      <Text color="var(--color-text)" fontSize="var(--text-sm)" maxW="48ch">{description}</Text>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Flex>
  );
}
