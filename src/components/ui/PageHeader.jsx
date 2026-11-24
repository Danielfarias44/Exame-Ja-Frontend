import { Box, Flex, Heading, Text } from "@chakra-ui/react";

export default function PageHeader({ title, description, badge, actions }) {
  return (
    <Flex
      as="header"
      justify="space-between"
      align={{ base: "flex-start", sm: "center" }}
      direction={{ base: "column", sm: "row" }}
      gap="var(--space-3)"
      mb="var(--space-6)"
    >
      <Box>
        <Flex align="center" gap="var(--space-3)" wrap="wrap" mb="var(--space-1)">
          <Heading
            as="h1"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
            lineHeight="var(--leading-tight)"
            color="var(--color-text)"
          >
            {title}
          </Heading>
          {badge}
        </Flex>
        {description && (
          <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
            {description}
          </Text>
        )}
      </Box>
      {actions && (
        <Flex gap="var(--space-2)" wrap="wrap" flexShrink={0}>
          {actions}
        </Flex>
      )}
    </Flex>
  );
}
