import { Badge } from "@chakra-ui/react";

const tones = {
  primary: { soft: "var(--color-primary-soft)", strong: "var(--color-primary)" },
  success: { soft: "var(--color-success-soft)", strong: "var(--color-success)" },
  warning: { soft: "var(--color-warning-soft)", strong: "var(--color-warning)" },
  error: { soft: "var(--color-error-soft)", strong: "var(--color-error)" },
  accent: { soft: "var(--color-accent-soft)", strong: "var(--color-accent)" },
  neutral: { soft: "var(--color-bg)", strong: "var(--color-text-muted)" },
};

export default function StatusBadge({ tone = "primary", solid = false, children, ...props }) {
  const colors = tones[tone] ?? tones.primary;

  return (
    <Badge
      px="var(--space-3)"
      py="var(--space-1)"
      borderRadius="var(--radius-full)"
      bg={solid ? colors.strong : colors.soft}
      color={solid ? "var(--color-text-on-primary)" : colors.strong}
      fontFamily="var(--font-heading)"
      fontWeight="var(--weight-bold)"
      fontSize="var(--text-xs)"
      textTransform="none"
      {...props}
    >
      {children}
    </Badge>
  );
}
