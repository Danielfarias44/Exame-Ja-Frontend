import { Badge, Flex, Text } from "@chakra-ui/react";
// Lista compacta de convênios (ou só etiquetas) para usarmos nas clinicas que aceitam tais convênios
export default function InsuranceBadges({ insurances = [], maxVisible = 3 }) {
  if (insurances.length === 0) {
    return (
      <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">
        Convênios não informados
      </Text>
    );
  }

  const visible = insurances.slice(0, maxVisible);
  const hidden = insurances.slice(maxVisible);

  const badgeProps = {
    bg: "var(--color-primary-soft)",
    color: "var(--color-primary)",
    fontSize: "var(--text-xs)",
    fontWeight: "var(--weight-medium)",
    px: "var(--space-3)",
    py: "var(--space-1)",
    borderRadius: "var(--radius-full)",
  };

  return (
    <Flex as="ul" role="list" wrap="wrap" gap="var(--space-2)" m={0} p={0} listStyleType="none">
      {visible.map((name) => (
        <li key={name}>
          <Badge {...badgeProps}>{name}</Badge>
        </li>
      ))}
      {hidden.length > 0 && (
        <li>
          <Badge {...badgeProps}>
            <span aria-hidden="true">+{hidden.length}</span>
            <span className="sr-only">e mais {hidden.length}: {hidden.join(", ")}</span>
          </Badge>
        </li>
      )}
    </Flex>
  );
}
