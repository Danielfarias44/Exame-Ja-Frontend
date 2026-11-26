import { Flex, Heading, Text } from "@chakra-ui/react";
import Button from "./Button";
export default function ErrorState({
  title = "Não foi possível carregar",
  description = "Verifique sua conexão e tente novamente.",
  onRetry,
  action,
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
      <Flex
        align="center"
        justify="center"
        boxSize="42px"
        borderRadius="var(--radius-full)"
        bg="var(--color-error)"
        color="var(--color-text-on-primary)"
        fontSize="xl"
        fontWeight="bold"
        aria-hidden="true"
      >
        !
      </Flex>
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
      {(onRetry || action) && (
        <Flex gap="var(--space-2)" wrap="wrap" justify="center">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
          {action}
        </Flex>
      )}
    </Flex>
  );
}
