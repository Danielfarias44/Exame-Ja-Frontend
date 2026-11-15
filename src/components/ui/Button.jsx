import { Button as ChakraButton } from "@chakra-ui/react";
// Componente do Botão, olhe o Styleguide para ter uma noção melhor de como usar, mas é uma aplicação simples
const variants = {
  primary: {
    bg: "var(--color-primary)",
    color: "var(--color-text-on-primary)",
    borderWidth: "var(--border-width-strong)",
    borderColor: "var(--color-primary)",
    _hover: { bg: "var(--color-primary-hover)", borderColor: "var(--color-primary-hover)" },
  },
  outline: {
    bg: "transparent",
    color: "var(--color-primary)",
    borderWidth: "var(--border-width-strong)",
    borderColor: "var(--color-primary)",
    _hover: { bg: "var(--color-primary-soft)" },
  },
  ghost: {
    bg: "transparent",
    color: "var(--color-primary)",
    borderWidth: "var(--border-width-strong)",
    borderColor: "transparent",
    _hover: { bg: "var(--color-primary-soft)" },
  },
};

export default function Button({ variant = "primary", ...props }) {
  return (
    <ChakraButton
      minH="var(--touch-target-min)"
      px="var(--space-6)"
      borderRadius="var(--radius-md)"
      fontFamily="var(--font-body)"
      fontWeight="var(--weight-bold)"
      fontSize="var(--text-sm)"
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
