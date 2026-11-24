import { Flex, Heading, Text } from "@chakra-ui/react";
// É o estado vázio de para caso não haja algo para exibir no momento
export default function EmptyState({
  title = "Nenhum resultado encontrado",
  description,
  action,
}) {
  return (
    <Flex
      role="status"
      direction="column"
      align="center"
      textAlign="center"
      gap="var(--space-3)"
      py="var(--space-8)"
      px="var(--space-4)"
      bg="var(--color-surface)"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-border-soft)"
      borderRadius="var(--radius-lg)"
    >
      <Heading
        as="h2"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-semibold)"
        fontSize="var(--text-lg)"
        color="var(--color-text)"
      >
        {title}
      </Heading>
      {description && (
        <Text color="var(--color-text-muted)" fontSize="var(--text-sm)" maxW="48ch">
          {description}
        </Text>
      )}
      {action}
    </Flex>
  );
}
