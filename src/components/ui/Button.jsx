import { Button as ChakraButton } from "@chakra-ui/react";
// Componente do Botão, olhe o Styleguide para ter uma noção melhor de como usar, mas é uma aplicação simples
const variants = {
  primary: {
    bg: "var(--color-primary)",
    color: "var(--color-text-on-primary)",
    borderColor: "var(--color-primary)",
    _hover: { bg: "var(--color-primary-hover)", borderColor: "var(--color-primary-hover)" },
  },
  outline: {
    bg: "var(--color-surface)",
    color: "var(--color-text)",
    borderColor: "var(--color-border-soft)",
    _hover: { borderColor: "var(--color-primary)", color: "var(--color-primary)" },
  },
  ghost: {
    bg: "transparent",
    color: "var(--color-primary)",
    borderColor: "transparent",
    _hover: { bg: "var(--color-primary-soft)" },
  },
};

export default function Button({ variant = "primary", ...props }) {
  return (
    <ChakraButton
      type={props.asChild ? undefined : "button"}
      minH="var(--touch-target-min)"
      px="var(--space-4)"
      borderWidth="var(--border-width)"
      borderRadius="var(--radius-md)"
      fontFamily="var(--font-heading)"
      fontWeight="var(--weight-semibold)"
      fontSize="var(--text-sm)"
      transition="all var(--duration-fast) var(--ease-standard)"
      {...variants[variant]}
      _disabled={{
        bg: "var(--color-border-soft)",
        borderColor: "var(--color-border-soft)",
        color: "var(--color-text-muted)",
        opacity: 1,
        cursor: "not-allowed",
      }}
      {...props}
    />
  );
}
