import { Heading } from "@chakra-ui/react";

export default function SectionTitle({ as = "h2", children, ...props }) {
  return (
    <Heading
      as={as}
      fontFamily="var(--font-heading)"
      fontWeight="var(--weight-bold)"
      fontSize={as === "h2" ? "var(--text-lg)" : "var(--text-base)"}
      lineHeight="var(--leading-tight)"
      color="var(--color-text)"
      {...props}
    >
      {children}
    </Heading>
  );
}
